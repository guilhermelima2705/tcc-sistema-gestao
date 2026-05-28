// MENU LATERAL E OVERLAY
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}
// PERFIL DO USUÁRIO
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("perfilDropdown");
  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove("aberto");
  }
  fecharSubmenu();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharMenu();
    fecharSubmenu();
    fecharModal();
  }
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
    window.location.href = "/login/login.html";
    return;
  }

  const nome  = sessionStorage.getItem("usuarioNome")  || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";
  document.getElementById("avatar").textContent      = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email;
}
// LÓGICA DE DATAS (Sincronizada com hoje)
function datasDestaSemanaBR() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diaSemana = hoje.getDay(); 
  const diffSeg   = diaSemana === 0 ? -6 : 1 - diaSemana;
  const seg = new Date(hoje);
  seg.setDate(hoje.getDate() + diffSeg);

  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${d.getFullYear()}`;
  });
}
const semana = datasDestaSemanaBR();

// ========== CARREGA AGENDAMENTOS DO SESSIONSTORAGE (ou dados padrão) ==========
let agendamentos = [];

async function carregarAgendamentosDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");

  try {
    const response = await fetch("/agendamento", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Injetando o Token JWT
      }
    });

    if (response.ok) {
      agendamentos = await response.json();
      renderizarTabela(); // Desenha a tabela com os dados reais
    } else if (response.status === 403 || response.status === 401) {
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "/login/login.html";
    }
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    alert("Erro ao conectar com o servidor.");
  }
}

// RENDERIZAÇÃO DA TABELA
function renderizarTabela() {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;

  corpo.innerHTML = "";

  if (agendamentos.length === 0) {
    if(vazia) vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  if(vazia) vazia.style.display = "none";

  agendamentos.forEach(a => {
    // 1. Formatação de Data e Hora que vem do LocalDateTime do Java (Ex: "2026-05-20T14:30:00")
    let dataFormatada = "";
    let horaFormatada = "";

    if (a.dataHora) {
      const dataObj = new Date(a.dataHora);
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      dataFormatada = `${dia}/${mes}/${ano}`;
      horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // 2. Navegando nos objetos aninhados (Acesso Seguro para não dar erro se vier null)
    // OBS: Verifique se na sua classe Cliente o campo é 'nome' e 'telefone' mesmo.
    const nomeCliente = a.cliente && a.cliente.nome ? a.cliente.nome : "Cliente não informado";
    const telCliente = a.cliente && a.cliente.telefone ? a.cliente.telefone : "Sem telefone";
    const nomeServico = a.servico && a.servico.nome ? a.servico.nome : "Serviço não informado";

    // 3. Lógica do botão WhatsApp
    let botaoWhatsapp = "";
    if (a.linkWhatsapp && a.linkWhatsapp.trim() !== "") {
      botaoWhatsapp = `
        <a href="${a.linkWhatsapp}" target="_blank" class="btn-whatsapp-inline" style="color: #25D366; text-decoration: none; font-weight: bold;">
          <i class="fa-brands fa-whatsapp"></i> Confirmar
        </a>`;
    } else {
      botaoWhatsapp = `
        <span style="color: #ccc; cursor: not-allowed;" title="Disponível apenas na véspera">
          <i class="fa-brands fa-whatsapp"></i> Indisponível
        </span>`;
    }

    // 4. Desenhando a linha na tabela
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${a.id}" onchange="atualizarBotoes()" />
      </td>
      <td class="col-nome-alinhado">${nomeCliente}</td>
      <td class="col-nowrap text-center">${telCliente}</td>
      <td class="celula-data">${dataFormatada}</td>
      <td class="col-nowrap">${horaFormatada}</td>
      <td class="col-truncar">${nomeServico}</td>
      <td class="col-nowrap text-center">${botaoWhatsapp}</td> 
    `;
    corpo.appendChild(tr);
  });

  atualizarBotoes();
}
// FUNÇÕES DE APOIO
function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}
function atualizarBotoes() {
  const marcados = document.querySelectorAll(".check-linha:checked").length;

  if (document.getElementById("btnAtualizar")) {
    document.getElementById("btnAtualizar").disabled = marcados !== 1;
  }
  if (document.getElementById("btnFinalizar")) {
    document.getElementById("btnFinalizar").disabled = marcados !== 1;
  }
  if (document.getElementById("btnExcluir")) {
    document.getElementById("btnExcluir").disabled = marcados === 0;
  }
}
function toggleSubmenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("agendSubmenu");
  const chevron = document.getElementById("agendChevron");
  if (menu?.classList.contains("aberto")) {
    fecharSubmenu();
  } else {
    menu?.classList.add("aberto");
    chevron?.classList.add("girado");
    document.getElementById("overlay")?.classList.add("ativo");
  }
}
function fecharSubmenu() {
  document.getElementById("agendSubmenu")?.classList.remove("aberto");
  document.getElementById("agendChevron")?.classList.remove("girado");
  const sidebar = document.getElementById("sidebar");
  if (!sidebar.classList.contains("aberta")) {
    document.getElementById("overlay")?.classList.remove("ativo");
  }
}
// MODAL DE EDIÇÃO
function abrirModalAtualizar() {
  const id = parseInt(document.querySelector(".check-linha:checked")?.dataset.id);
  const ag = agendamentos.find(a => a.id === id);
  if (!ag) return;

  document.getElementById("editNome").value = ag.nome;
  document.getElementById("editTel").value = ag.tel;
  document.getElementById("editHora").value = ag.hora;
  document.getElementById("editServico").value = ag.servico;

  const [d, m, a] = ag.data.split("/");
  document.getElementById("editData").value = `${a}-${m}-${d}`;
  document.getElementById("modalAtualizar").classList.add("aberto");
}

function fecharModal() {
  document.getElementById("modalAtualizar").classList.remove("aberto");
}

// Máscara e trava de telefone no modal de atualizar
document.getElementById("editTel").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
  this.value = v;
});

function salvarAtualizacao() {
  const id = parseInt(document.querySelector(".check-linha:checked")?.dataset.id);
  const nome = document.getElementById("editNome").value.trim();
  const tel = document.getElementById("editTel").value.trim();
  const hora = document.getElementById("editHora").value;
  const servico = document.getElementById("editServico").value.trim();
  const msg = document.getElementById("msgAtualizar");

  // Limpa mensagem anterior
  msg.className = "msg";
  msg.textContent = "";

  // Validação de telefone
  const numerosApenas = tel.replace(/\D/g, "");
  if (numerosApenas.length < 10 || numerosApenas.length > 11) {
    msg.textContent = "Digite um telefone válido (10 ou 11 dígitos).";
    msg.classList.add("erro");
    return;
  }

  const dataISO = document.getElementById("editData").value;
  let dataBR = "";
  if (dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    dataBR = `${dia}/${mes}/${ano}`;
  }
  const idx = agendamentos.findIndex(a => a.id === id);
  if (idx !== -1) {
    agendamentos[idx] = { ...agendamentos[idx], nome, tel, data: dataBR, hora, servico };
  }
  fecharModal();
  renderizarTabela();
}
function excluirSelecionados() {
  const checkboxes = document.querySelectorAll(".check-linha:checked");
  const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
  if (ids.length === 0) return;

  const qtd = ids.length;
  document.getElementById("textoConfirmacaoExclusao").textContent =
    `Tem certeza que deseja excluir ${qtd} agendamento(s)? Esta ação não pode ser desfeita.`;

  window._idsParaExcluir = ids;
  document.getElementById("modalConfirmarExclusao").classList.add("aberto");
}

function fecharModalConfirmacao() {
  document.getElementById("modalConfirmarExclusao").classList.remove("aberto");
  window._idsParaExcluir = [];
}

async function executarExclusao() {
  const ids = window._idsParaExcluir || [];
  if (ids.length === 0) return;

  const token = sessionStorage.getItem("meuTccToken");

  // Criamos um grupo de requisições para deletar todos os IDs selecionados
  try {
    const promessas = ids.map(id =>
        fetch(`/agendamento/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
    );

    // Aguarda o backend responder todas as exclusões
    const respostas = await Promise.all(promessas);

    // Verifica se algum delete falhou
    const todasOk = respostas.every(res => res.ok);

    if (todasOk) {
      // Atualiza a lista local removendo os IDs deletados
      agendamentos = agendamentos.filter(a => !ids.includes(a.id));
      fecharModalConfirmacao();
      renderizarTabela(); // Desenha a tabela atualizada
    } else {
      alert("Houve um erro ao tentar excluir um ou mais agendamentos no servidor.");
    }

  } catch (error) {
    console.error("Erro ao deletar agendamentos:", error);
    alert("Erro de conexão ao tentar excluir.");
  }
}

// Permissões
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

// Form de atualizar
const formAtualizar = document.getElementById("formAtualizar");
if (formAtualizar) {
  formAtualizar.addEventListener("submit", function(event) {
    event.preventDefault();
    salvarAtualizacao();
  });
}

// INICIALIZAÇÃO
carregarPerfil();
carregarAgendamentosDaAPI(); // Dispara o Fetch logo que entra na tela!

// BOTÃO WHATSAPP - ENVIA CONFIRMAÇÃO PARA A CLIENTE
const btnWhats = document.querySelector(".btn-whats");
if (btnWhats) {
  btnWhats.onclick = function() {
    const selectedRows = document.querySelectorAll(".check-linha:checked");
    if (selectedRows.length !== 1) {
      alert("Selecione UM agendamento para enviar a confirmação.");
      return;
    }
    
    const id = parseInt(selectedRows[0].dataset.id);
    const agendamento = agendamentos.find(a => a.id === id);
    
    if (!agendamento) {
      alert("Agendamento não encontrado.");
      return;
    }
    
    const msg = `*ESPAÇO CARMEM LÚCIA*\n\n` +
      `Olá *${agendamento.nome}*, seu agendamento está CONFIRMADO!\n\n` +
      `Data: ${agendamento.data}\n` +
      `Hora: ${agendamento.hora}\n` +
      `Serviço: ${agendamento.servico}\n\n` +
      `Agradecemos a preferência.`;
    
    const telefoneCliente = agendamento.tel.replace(/\D/g, '');
    window.open(`https://wa.me/55${telefoneCliente}?text=${encodeURIComponent(msg)}`, "_blank");
  };
}

async function finalizarAtendimentoSelecionado() {
  const selecionado = document.querySelector(".check-linha:checked");
  if (!selecionado) return;

  const id = parseInt(selecionado.dataset.id);
  const token = sessionStorage.getItem("meuTccToken");

  if (!confirm("Deseja finalizar este atendimento? Isso gerará o lançamento financeiro no sistema.")) return;

  try {
    // Faz o PATCH apontando para a sua rota do Spring Boot
    const response = await fetch(`/agendamento/${id}/finalizar`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const msgSucesso = await response.text();
      alert(msgSucesso); // Exibe: "Atendimento finalizado com sucesso e financeiro gerado!"

      // Remove o agendamento da tela já que ele foi concluído
      agendamentos = agendamentos.filter(a => a.id !== id);
      renderizarTabela();
    } else {
      const msgErro = await response.text();
      alert(`Erro do servidor: ${msgErro}`);
    }
  } catch (error) {
    console.error("Erro ao finalizar atendimento:", error);
    alert("Erro de conexão ao tentar finalizar o atendimento.");
  }
}