// HOME.JS - Tela inicial do sistema Espaço Carmem Lúcia
// Responsável por: saudação, cards de agendamentos e lucro,
// controle de permissões por perfil e menu lateral.

// MENU LATERAL - Abre o menu deslizante ao clicar no hambúrguer
// HOME.JS - Tela inicial integrada com o banco de dados via Spring Boot

// VARIÁVEIS GLOBAIS PARA ARMAZENAR OS DADOS REAIS DA API
let agendamentosDados = [];
let lancamentosFinanceirosHoje = [];
let totalLucroHoje = 0;

// MENU LATERAL
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fecharMenu();
});

// AVATAR / PERFIL
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

function carregarPerfil() {
  const token = sessionStorage.getItem("meuTccToken");

  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }
  const nome = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";

  if(!sessionStorage.getItem("usuarioCargo")){
    sessionStorage.setItem("usuarioCargo", "proprietaria");
  }

  document.getElementById("avatar").textContent      = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email;
}

// EXIBIÇÃO DE DATA E SAUDAÇÃO
function mostrarData() {
  const hoje   = new Date();
  const opcoes = { weekday: "long", day: "2-digit", month: "long" };
  const texto  = hoje.toLocaleDateString("pt-BR", opcoes);
  const hora   = hoje.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const el = document.getElementById("dataHoje");
  if (el) {
    el.textContent = texto.charAt(0).toUpperCase() + texto.slice(1) + " · " + hora;
  }
}

function saudacao() {
  const h   = new Date().getHours();
  const msg = h < 12 ? "Bom dia!" : h < 18 ? "Boa tarde!" : "Boa noite!";
  document.querySelector(".sub").textContent = msg;
}

async function carregarDadosDoBackend() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) return;

  // 1. BUSCA DADOS FINANCEIROS REAIS
  try {
    const responseFin = await fetch("/financeiro", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (responseFin.ok) {
      const todosLancamentos = await responseFin.json();
      const hoje = new Date();

      // Filtra apenas o que é ENTRADA e que foi criado HOJE
      lancamentosFinanceirosHoje = todosLancamentos.filter(l => {
        const dataLanc = new Date(l.data);
        return l.tipo === "ENTRADA" &&
            dataLanc.getDate() === hoje.getDate() &&
            dataLanc.getMonth() === hoje.getMonth() &&
            dataLanc.getFullYear() === hoje.getFullYear();
      });

      // Calcula o somatório do lucro do dia
      totalLucroHoje = lancamentosFinanceirosHoje.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    }
  } catch (error) {
    console.error("Erro ao buscar dados financeiros para a Home:", error);
  }

  // 2. BUSCA AGENDAMENTOS REAIS (Com proteção caso o Controller não esteja pronto)
  try {
    const responseAgend = await fetch("/agendamento", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (responseAgend.ok) {
      const todosAgendamentos = await responseAgend.json();
      const hoje = new Date();

      // Filtra agendamentos marcados para o dia de hoje
      agendamentosDados = todosAgendamentos.filter(a => {
        const dataAgend = new Date(a.data); // Ajuste aqui conforme o nome do campo de data do seu Java
        return dataAgend.getDate() === hoje.getDate() &&
            dataAgend.getMonth() === hoje.getMonth() &&
            dataAgend.getFullYear() === hoje.getFullYear();
      });

      // Ordena por horário
      agendamentosDados.sort((a, b) => a.hora.localeCompare(b.hora));
    }
  } catch (error) {
    console.log("Rota /agendamento ainda não integrada ou offline. Usando lista vazia.");
    agendamentosDados = [];
  }

  // Renderiza os componentes na tela com os dados atualizados do banco
  renderizarAgendamentosHoje();
}

// CARREGA OS AGENDAMENTOS NA TELA
function renderizarAgendamentosHoje() {
  const lista = document.getElementById("listaHome");
  if (!lista) return;

  lista.innerHTML = "";

  if (agendamentosDados.length === 0) {
    const li = document.createElement("li");
    li.className   = "card-item-vazio";
    li.textContent = "Nenhum agendamento para hoje";
    lista.appendChild(li);
    return;
  }

  agendamentosDados.forEach(a => {
    const li = document.createElement("li");
    li.className = "card-item";

    // Mapeamento dinâmico baseado no objeto (Cliente e Serviço)
    const clienteNome = a.cliente ? a.cliente.nome : (a.nome || "Cliente");
    const servicoNome = a.servico ? a.servico.nome : (a.servico || "Serviço");
    const horario = a.hora || "00:00";

    li.innerHTML = `
      <span class="card-item-hora">${horario}</span>
      <span class="card-item-texto">
        <span class="card-item-nome">${clienteNome}</span>
        <span class="card-item-servico">${servicoNome}</span>
      </span>
    `;
    lista.appendChild(li);
  });
}

// LUCRO DO DIA (DADOS REAIS AGRUPADOS POR CATEGORIA DO ENUM)
function carregarLucroHoje() {
  const lista = document.getElementById("listaLucro");
  if (!lista) return;
  lista.innerHTML = "";

  // Agrupa o faturamento de hoje pelas categorias do seu Enum Java (SALAO, COSMETICO, PESSOAL)
  const faturamentoPorCategoria = {};
  lancamentosFinanceirosHoje.forEach(l => {
    const cat = l.categoria || "OUTROS";
    if (!faturamentoPorCategoria[cat]) {
      faturamentoPorCategoria[cat] = { valor: 0, qtd: 0 };
    }
    faturamentoPorCategoria[cat].valor += parseFloat(l.valor);
    faturamentoPorCategoria[cat].qtd += 1;
  });

  const chaves = Object.keys(faturamentoPorCategoria);

  if (chaves.length === 0) {
    const li = document.createElement("li");
    li.className = "card-item-vazio";
    li.textContent = "Nenhum faturamento registrado hoje.";
    lista.appendChild(li);
    return;
  }

  chaves.forEach(cat => {
    const li = document.createElement("li");
    li.className = "card-item";

    // Tradução amigável dos Enums para exibição no Dashboard
    let nomeExibicao = "Outros";
    if (cat === "SALAO") nomeExibicao = "Serviços (Salão)";
    if (cat === "COSMETICO") nomeExibicao = "Produtos (Cosméticos)";
    if (cat === "PESSOAL") nomeExibicao = "Pessoal / Outros";

    li.innerHTML = `
      <span class="card-item-hora" style="font-weight:600; color:var(--rose-gold-dark);">
        R$ ${faturamentoPorCategoria[cat].valor.toFixed(2).replace(".", ",")}
      </span>
      <div class="card-item-texto">
        <span class="card-item-nome">${nomeExibicao}</span>
        <span class="card-item-servico">${faturamentoPorCategoria[cat].qtd} transações</span>
      </div>
    `;
    lista.appendChild(li);
  });
}

function toggleLucro() {
  const el = document.getElementById("lucroValor");
  const lista = document.getElementById("listaLucro");
  const icone = document.getElementById("iconOlho");
  const aberto = icone.classList.contains("fa-eye");

  if (aberto) {
    el.textContent = "";
    lista.innerHTML = "";
    icone.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    // Exibe o total calculado direto do banco de dados
    el.textContent = `R$ ${totalLucroHoje.toFixed(2).replace('.', ',')}`;
    carregarLucroHoje();
    icone.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// PERMISSÕES DE INTERFACE
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    if (restritos.includes(file))
      link.closest("li").style.display = "none";
  });
})();

(function controlarLinkFinancas() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const linkDetalhes = document.getElementById("link-ver-detalhes");
  if (linkDetalhes && cargo !== "proprietaria") {
    linkDetalhes.style.display = "none";
  }
})();

// BOTÃO WHATSAPP - AGORA GERANDO TEXTO COM BASE NOS DADOS REAIS DO BANCO
const btnWhatsHome = document.querySelector(".btn-whats");
if (btnWhatsHome) {
  btnWhatsHome.onclick = function() {
    const hoje = new Date().toLocaleDateString("pt-BR");

    if (agendamentosDados.length === 0) {
      alert("Nenhum agendamento real carregado para hoje.");
      return;
    }

    let msg = `*RESUMO DE AGENDAMENTOS - ${hoje}*\n\n`;
    agendamentosDados.forEach(a => {
      const clienteNome = a.cliente ? a.cliente.nome : (a.nome || "Cliente");
      const servicoNome = a.servico ? a.servico.nome : (a.servico || "Serviço");
      const horario = a.hora || "00:00";
      msg += `⏰ ${horario} - *${clienteNome}* - ${servicoNome}\n`;
    });
    msg += `\nTotal: ${agendamentosDados.length} agendamento(s) no banco.`;

    const telefoneCarmem = "5561998015647";
    window.open(`https://wa.me/${telefoneCarmem}?text=${encodeURIComponent(msg)}`, "_blank");
  };
}

// INICIALIZAÇÃO DA HOME
window.addEventListener("load", function() {
  mostrarData();
  saudacao();
  carregarPerfil();
  carregarDadosDoBackend();
});