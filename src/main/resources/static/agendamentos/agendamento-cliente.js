/* AGENDAMENTO-CLIENTE.JS — FLUXO INTELIGENTE COM HORÁRIOS PADRONIZADOS E BLOQUEIO DE FOLGAS */

let dadosAgendamentoSalvo = {};
let clienteIdIdentificado = null;
let nomeClienteIdentificado = "";
let clienteJaCadastrado = false;
let datasBloqueadasDoFuncionario = []; // ✨ VARIÁVEL GLOBAL PARA GUARDAR AS FOLGAS

// Submit do formulário
document.getElementById("formAgendamento").addEventListener("submit", function(e) {
  e.preventDefault();
  agendar();
});

// Limpar todo o formulário e resetar os estados dos campos
function limparFormulario() {
  ["nomeCliente", "telCliente", "dataNascimento", "dataAgend", "horaAgend", "servicoAgend", "funcAgend"]
      .forEach(function(id) {
        const el = document.getElementById(id);
        if(el) el.value = "";
      });

  document.getElementById("secaoCadastroCliente").style.display = "none";
  document.getElementById("secaoDadosAgendamento").style.display = "none";

  // Destrava os campos de validação iniciais
  document.getElementById("telCliente").disabled = false;
  document.getElementById("btnVerificarTel").disabled = false;

  // Reseta os estados dos combos dinâmicos
  document.getElementById("dataAgend").disabled = true;
  document.getElementById("horaAgend").disabled = true;
  document.getElementById("horaAgend").innerHTML = '<option value="">Escolha a data primeiro...</option>';

  clienteIdIdentificado = null;
  clienteJaCadastrado = false;
  datasBloqueadasDoFuncionario = []; // Reseta as folgas

  const msg = document.getElementById("msgAgendamento");
  msg.className = "msg";
  msg.textContent = "";
}

async function verificarTelefone() {
  const telInput = document.getElementById("telCliente").value.trim();
  const msg = document.getElementById("msgAgendamento");
  msg.className = "msg";
  msg.textContent = "";

  const numsTel = telInput.replace(/\D/g, "");
  if (numsTel.length < 10 || numsTel.length > 11) {
    msg.textContent = "⚠️ Digite um número de telefone válido com DDD.";
    msg.classList.add("show", "erro");
    return;
  }

  try {
    const response = await fetch(`/cliente/buscar-por-telefone?telefone=${numsTel}`);

    if (response.ok) {
      const cliente = await response.json();
      clienteIdIdentificado = cliente.id;
      nomeClienteIdentificado = cliente.nome; // ✨ Guarda o nome real que veio do banco
      clienteJaCadastrado = true;

      document.getElementById("telCliente").disabled = true;
      document.getElementById("btnVerificarTel").disabled = true;

      document.getElementById("saudacaoClienteExistente").textContent = `Olá, ${cliente.nome.split(" ")[0]}! Que bom ver você de volta. Escolha os detalhes do seu horário:`;
      document.getElementById("secaoDadosAgendamento").style.display = "block";

      carregarOpcoesDoBanco();
    } else if (response.status === 404) {
      // CLIENTE NÃO ENCONTRADO (404 NOT FOUND) -> Novo Cadastro
      document.getElementById("telCliente").disabled = true;
      document.getElementById("btnVerificarTel").disabled = true;

      document.getElementById("secaoCadastroCliente").style.display = "block";
      document.getElementById("secaoDadosAgendamento").style.display = "block";

      carregarOpcoesDoBanco();
    } else {
      // 🚨 MUDANÇA AQUI: Captura o status numérico do erro (ex: 400, 500) e o texto do Java
      const textoErroServer = await response.text();
      msg.textContent = `⚠️ Erro ${response.status} do Servidor: ${textoErroServer}`;
      msg.classList.add("show", "erro");
    }
  } catch (error) {
    console.error("Erro na verificação de telefone:", error);
    msg.textContent = "❌ Falha na requisição: " + error.message;
    msg.classList.add("show", "erro");
  }
}

async function carregarOpcoesDoBanco() {
  try {
    // 1. Busca Serviços Ativos
    const resServicos = await fetch("/servico");
    if (resServicos.ok) {
      const lista = await resServicos.json();
      const select = document.getElementById("servicoAgend");
      select.innerHTML = '<option value="">Selecione o serviço...</option>';
      lista.forEach(s => {
        select.innerHTML += `<option value="${s.id}" data-nome="${s.nome}">${s.nome} — R$ ${parseFloat(s.valor).toFixed(2).replace('.',',')}</option>`;
      });
    }

    // 2. Busca Funcionários Ativos
    const resFuncionarios = await fetch("/funcionario");
    if (resFuncionarios.ok) {
      const lista = await resFuncionarios.json();
      const select = document.getElementById("funcAgend");
      select.innerHTML = '<option value="">Selecione o profissional...</option>';
      const ativos = lista.filter(f => f.ativo === true || f.ativo === undefined);
      ativos.forEach(f => {
        let telFunc = f.telefone ? f.telefone.replace(/\D/g, "") : "5561998015647";
        if(!telFunc.startsWith("55") && telFunc.length > 0) telFunc = "55" + telFunc;

        select.innerHTML += `<option value="${f.id}" data-nome="${f.nome}" data-whatsapp="${telFunc}">${f.nome}</option>`;
      });
    }
  } catch (error) {
    console.error("Erro ao popular selects públicos:", error);
  }
}


// Executado quando o usuário escolhe um Colaborador
async function liberarData() {
  const funcSelect = document.getElementById("funcAgend").value;
  const dataInput = document.getElementById("dataAgend");
  const horaSelect = document.getElementById("horaAgend");

  // Reseta buscas e seleções antigas de folga
  datasBloqueadasDoFuncionario = [];
  dataInput.value = "";
  horaSelect.disabled = true;
  horaSelect.innerHTML = '<option value="">Escolha a data primeiro...</option>';

  if (funcSelect) {
    dataInput.disabled = false; // Libera a data para escolha

    // ✨ BUSCA AS FOLGAS DO COLABORADOR SELECIONADO NO JAVA
    try {
      const response = await fetch(`/folga/funcionario/${funcSelect}`);
      if (response.ok) {
        datasBloqueadasDoFuncionario = await response.json();
      }
    } catch (error) {
      console.error("Erro ao carregar folgas do profissional:", error);
    }
  } else {
    dataInput.disabled = true;
  }
}

// Executado quando o usuário escolhe a Data -> Monta o Select de 30 em 30 min
function liberarHorarios() {
  const dataValue = document.getElementById("dataAgend").value;
  const horaSelect = document.getElementById("horaAgend");
  const msg = document.getElementById("msgAgendamento");

  if (!dataValue) {
    horaSelect.disabled = true;
    return;
  }

  // ✨ 1. VALIDAÇÃO DE BLOQUEIO POR FOLGA OU RECESSO VINDO DO BANCO
  if (datasBloqueadasDoFuncionario.includes(dataValue)) {
    msg.textContent = "⚠️ O(A) profissional selecionado(a) não atenderá nesta data devido a folga ou recesso. Escolha outro dia.";
    msg.classList.add("show", "erro");
    document.getElementById("dataAgend").value = "";
    horaSelect.disabled = true;
    return;
  }

  // 2. Validação padrão de domingos (0) e segundas (1)
  const diaSemana = new Date(dataValue + "T12:00").getDay();
  if (diaSemana === 0 || diaSemana === 1) {
    msg.textContent = "O salão não funciona aos domingos e segundas. Escolha outro dia.";
    msg.classList.add("show", "erro");
    document.getElementById("dataAgend").value = "";
    horaSelect.disabled = true;
    return;
  } else {
    msg.className = "msg";
    msg.textContent = "";
  }

  // Libera a caixinha e popula de 30 em 30 minutos (Das 07:00 às 18:00)
  horaSelect.disabled = false;
  horaSelect.innerHTML = '<option value="">Selecione o horário...</option>';

  let horaInicio = 7;
  let horaFim = 18;

  for (let h = horaInicio; h <= horaFim; h++) {
    let horaStr = String(h).padStart(2, "0");

    // Adiciona o horário cheio (:00)
    horaSelect.innerHTML += `<option value="${horaStr}:00">${horaStr}:00</option>`;

    // Adiciona o horário de meia hora (:30) - Trava para não criar 18:30
    if (h < horaFim) {
      horaSelect.innerHTML += `<option value="${horaStr}:30">${horaStr}:30</option>`;
    }
  }
}

async function agendar() {
  const telInput = document.getElementById("telCliente").value.trim();
  const numsTel = telInput.replace(/\D/g, "");

  const data = document.getElementById("dataAgend").value;
  const hora = document.getElementById("horaAgend").value;
  const servicoId = document.getElementById("servicoAgend").value;
  const funcionarioId = document.getElementById("funcAgend").value;

  const msg = document.getElementById("msgAgendamento");
  msg.className = "msg";
  msg.textContent = "";

  // Se o cliente não existia no MySQL, cadastra ele primeiro
  if (!clienteJaCadastrado) {
    const nome = document.getElementById("nomeCliente").value.trim();
    const dataNasc = document.getElementById("dataNascimento").value;

    if (!nome || !dataNasc) {
      msg.textContent = "⚠️ Preencha seu nome e data de nascimento para criar seu cadastro.";
      msg.classList.add("show", "erro");
      return;
    }

    try {
      const resNovoCliente = await fetch("/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, telefone: numsTel, dataNascimento: dataNasc, ativo: true })
      });

      if (resNovoCliente.ok) {
        const clienteCriado = await resNovoCliente.json();
        clienteIdIdentificado = clienteCriado.id; // Pega o ID gerado pelo banco
        clienteJaCadastrado = true;
      } else {
        const txt = await resNovoCliente.text();
        msg.textContent = `Erro ao salvar cadastro de cliente: ${txt}`;
        msg.classList.add("show", "erro");
        return;
      }
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      msg.textContent = "❌ Falha ao processar novo cadastro de cliente.";
      msg.classList.add("show", "erro");
      return;
    }
  }

  // Validação dos dados do agendamento em si
  if (!data || !hora || !servicoId || !funcionarioId) {
    msg.textContent = "Escolha o profissional, data, hora e serviço para concluir.";
    msg.classList.add("show", "erro");
    return;
  }

  const localDateTimeString = `${data}T${hora}:00`;
  const servicoSelect = document.getElementById("servicoAgend");
  const funcSelect = document.getElementById("funcAgend");
  const nomeServico = servicoSelect.options[servicoSelect.selectedIndex].getAttribute("data-nome");
  const nomeFunc = funcSelect.options[funcSelect.selectedIndex].getAttribute("data-nome");

  const agendamentoDTO = {
    clienteId: parseInt(clienteIdIdentificado),
    funcionarioId: parseInt(funcionarioId),
    servicoId: parseInt(servicoId),
    dataHora: localDateTimeString
  };

  try {
    const response = await fetch("/agendamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agendamentoDTO)
    });

    if (response.ok) {
      const [ano, mes, dia] = data.split("-");

      // Pega o nome digitado se for novo, ou o nome que veio do banco se for antigo
      const nomeFinalDoCliente = clienteJaCadastrado ? nomeClienteIdentificado : document.getElementById("nomeCliente").value.trim();

      // Captura o whatsapp do funcionário que está guardado no select
      const whatsappDoFuncionario = funcSelect.options[funcSelect.selectedIndex].getAttribute("data-whatsapp");

      dadosAgendamentoSalvo = {
        nome: nomeFinalDoCliente,
        tel: numsTel,
        data: `${dia}/${mes}/${ano}`,
        hora,
        servico: nomeServico,
        func: nomeFunc,
        whatsappDestino: whatsappDoFuncionario
      };
      document.getElementById("modalSucesso").classList.add("aberto");
    } else {
      const textoErro = await response.text();
      msg.textContent = `Agendamento recusado: ${textoErro}`;
      msg.classList.add("show", "erro");
    }
  } catch (error) {
    console.error("Erro no POST do agendamento:", error);
    msg.textContent = "❌ Erro de conexão ao salvar agendamento.";
    msg.classList.add("show", "erro");
  }
}

// Abre o app do WhatsApp para envio do comprovante
function enviarWhatsApp() {
  const { nome, tel, data, hora, servico, func, whatsappDestino } = dadosAgendamentoSalvo;

  const msg =
      `*Novo Agendamento --- Espaço Carmem Lúcia*\n\n` +
      `*Nome:* ${nome}\n` +
      `*Telefone:* ${tel}\n` +
      `*Data:* ${data}\n` +
      `*Hora:* ${hora}\n` +
      `*Serviço:* ${servico}\n` +
      `*Colaborador(a):* ${func}\n\n` +
      `_Agendamento realizado e salvo no banco de dados._`;

  window.open(`https://wa.me/${whatsappDestino}?text=${encodeURIComponent(msg)}`, "_blank");
  fecharModal();
  limparFormulario();
}

function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
}

// Configuração mínima e listeners de comportamento visual
(function inicializarConfiguracoesVisuais() {
  // Configura data mínima como "hoje"
  const campoData = document.getElementById("dataAgend");
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  campoData.min = `${hoje.getFullYear()}-${mm}-${dd}`;

  // Vincula os listeners de mudança para controle de fluxo
  const funcSelect = document.getElementById("funcAgend");
  if(funcSelect) funcSelect.addEventListener("change", liberarData);

  const dataInput = document.getElementById("dataAgend");
  if(dataInput) dataInput.addEventListener("change", liberarHorarios);

  // Fechamento de modais
  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("modal-overlay")) fecharModal();
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") fecharModal();
  });

  // Máscara dinâmica de Telefone
  document.getElementById("telCliente").addEventListener("input", function(e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 2) e.target.value = v;
    else if (v.length <= 7) e.target.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else e.target.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  });
})();

// Acessibilidade
function toggleAcessibilidade() {
  const ativa = document.body.classList.toggle("acessibilidade-ativa");
  sessionStorage.setItem("acessibilidade", ativa ? "1" : "0");
}

window.addEventListener("load", function() {
  if (sessionStorage.getItem("acessibilidade") === "1") {
    document.body.classList.add("acessibilidade-ativa");
  }
});