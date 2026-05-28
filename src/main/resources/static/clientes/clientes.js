// Menu lateral
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharMenu();
    fecharModal("modalAtualizar");
    fecharModal("modalAcoes");
  }
});

function formatarTelefone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  
  let resultado = '';
  if (v.length <= 2) {
    resultado = v;
  } else if (v.length <= 7) {
    resultado = `(${v.slice(0,2)}) ${v.slice(2)}`;
  } else if (v.length <= 11) {
    if (v.length === 11) {
      resultado = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
    } else {
      resultado = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6,10)}`;
    }
  }
  input.value = resultado;
}

// Avatar / dropdown de perfil
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
  const nome = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";

  // Preenche direto, sem validação restritiva
  document.getElementById("avatar").textContent = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent = nome;
  document.getElementById("perfilEmail").textContent = email;
}

// Envia link de agendamento via WhatsApp para o cliente
function enviarLinkAgendamento(id) {
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;
  
  // Extrai apenas os números do telefone
  const telefone = cliente.numero.replace(/\D/g, '');
  if (telefone.length < 10 || telefone.length > 11) {
    alert("Telefone do cliente inválido. Cadastre um número com 10 ou 11 dígitos.");
    return;
  }
  
  const link = `${window.location.origin}/agendamento-cliente/agendamento-cliente.html?cliente=${cliente.id}`;
  const msg = `Olá *${cliente.nome}*, acesse o link para agendar seu horário:\n\n${link}`;
  
  window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Dados dos clientes
let clientes = []; // Começa vazia, carregada direto do MySQL

async function carregarClientesDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");

  if (!token) {
    // ALERTA DE DEBUG:
    alert("DEBUG: Token JWT não encontrado! Redirecionando para login...");
    window.location.href = "../login/login.html";
    return;
  }

  try {
    const response = await fetch("/cliente", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      clientes = await response.json();
      renderizarTabela(clientes);
    } else if (response.status === 403 || response.status === 401) {
      // ALERTA DE DEBUG:
      alert(`DEBUG: O Java rejeitou o Token (Erro ${response.status}). O Token expirou ou é inválido!`);
      window.location.href = "../login/login.html";
    } else {
      alert(`DEBUG: Erro diferente no servidor. Código: ${response.status}`);
    }
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    alert("Erro de conexão com o servidor. O backend está rodando?");
  }
}

// Função para formatar o telefone apenas visualmente na tabela
function formatarTelefoneTexto(tel) {
  if (!tel) return "Sem número";
  const num = tel.replace(/\D/g, ''); // Remove tudo que não for número
  if (num.length === 11) {
    return `(${num.slice(0,2)}) ${num.slice(2,7)}-${num.slice(7)}`;
  } else if (num.length === 10) {
    return `(${num.slice(0,2)}) ${num.slice(2,6)}-${num.slice(6)}`;
  }
  return tel; // Se vier um número muito louco, retorna como está
}

function renderizarTabela(lista) {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;

  corpo.innerHTML = "";

  // Ordena os ativos primeiro
  const ordenados = [...lista].sort((a, b) => b.ativo - a.ativo);

  if (ordenados.length === 0) {
    if (vazia) vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  if (vazia) vazia.style.display = "none";

  ordenados.forEach(c => {
    const tr = document.createElement("tr");
    if (!c.ativo) tr.classList.add("cliente-inativo");

    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${c.id}" onchange="atualizarBotoes()" />
       </td>
      <td class="col-nome">
        <span class="status-bolinha ${c.ativo ? 'ativo' : 'inativo'}"></span>
        ${c.nome}
      </td>
      <td class="col-nowrap">${formatarTelefoneTexto(c.telefone)}</td>
      <td class="col-obs">${c.observacoes || "—"}</td>
      <td class="col-nowrap" style="text-align:center; width:40px;">
        <button class="btn-share" onclick="enviarLinkAgendamento(${c.id})" 
                style="background:transparent; border:none; color:var(--text-soft); cursor:pointer; opacity:0.5;"
                onmouseover="this.style.opacity='1'"
                onmouseout="this.style.opacity='0.5'">
          <i class="fa-solid fa-share-alt"></i>
        </button>
      </td>
    `;
    corpo.appendChild(tr);
  });

  atualizarBotoes();
}

function filtrarClientes() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  const filtrados = clientes.filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      (c.telefone && c.telefone.includes(termo)) ||
      (c.observacoes && c.observacoes.toLowerCase().includes(termo))
  );
  renderizarTabela(filtrados);
}

function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}

function atualizarBotoes() {
  const total    = document.querySelectorAll(".check-linha").length;
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  const checkTodos = document.getElementById("checkTodos");
  if (checkTodos) checkTodos.checked = total > 0 && marcados === total;

  const btnAtualizar = document.getElementById("btnAtualizar");
  const btnExcluir = document.getElementById("btnExcluir");

  if (btnAtualizar) btnAtualizar.disabled = marcados !== 1;
  if (btnExcluir) btnExcluir.disabled = marcados === 0;
}

function getClienteSelecionado() {
  const cb = document.querySelector(".check-linha:checked");
  if (!cb) return null;
  return clientes.find(c => c.id === parseInt(cb.dataset.id));
}

function abrirModalAtualizar() {
  const c = getClienteSelecionado();
  if (!c) return;
  document.getElementById("editNome").value   = c.nome;
  document.getElementById("editNumero").value = c.telefone || ""; // Campo ID 'editNumero' mantido do HTML
  document.getElementById("editObs").value    = c.observacoes || "";
  document.getElementById("modalAtualizar").classList.add("aberto");
}

async function salvarAtualizacao() {
  const c = getClienteSelecionado();
  if (!c) return;

  const token = sessionStorage.getItem("meuTccToken");
  const nomeNovo = document.getElementById("editNome").value.trim();
  const telefoneNovo = document.getElementById("editNumero").value.trim();
  const obsNova = document.getElementById("editObs").value.trim();

  if (!nomeNovo || !telefoneNovo) {
    alert("Nome e Telefone são obrigatórios.");
    return;
  }

  const dadosParaOBackend = {
    nome: nomeNovo,
    telefone: telefoneNovo,
    observacoes: obsNova,
    cpf: c.cpf,
    dataNascimento: c.dataNascimento // Mantém a data cadastrada para não dar null
  };

  try {
    const response = await fetch(`/cliente/${c.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosParaOBackend)
    });

    if (response.ok) {
      fecharModal("modalAtualizar");
      carregarClientesDaAPI(); // Recarrega do banco atualizado
    } else {
      alert("Erro ao atualizar dados do cliente no servidor.");
    }
  } catch (error) {
    console.error("Erro no PUT:", error);
  }
}

function abrirModalAcoes() {
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  if (marcados === 0) return;

  const btnStatus  = document.getElementById("btnAcaoStatus");
  const subtitulo  = document.getElementById("modalAcoesSubtitulo");

  if (marcados === 1) {
    const c = getClienteSelecionado();
    if (btnStatus) {
      btnStatus.style.display = "flex";
      if (c.ativo) {
        btnStatus.innerHTML = '<i class="fa-solid fa-ban"></i> Desativar';
      } else {
        btnStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Ativar';
      }
    }
    if (subtitulo) subtitulo.textContent = c.nome;
  } else {
    if (btnStatus) btnStatus.style.display = "none";
    if (subtitulo) subtitulo.textContent = `${marcados} clientes selecionados`;
  }

  document.getElementById("modalAcoes").classList.add("aberto");
}

async function confirmarStatus() {
  const c = getClienteSelecionado();
  if (!c) return;
  const token = sessionStorage.getItem("meuTccToken");

  try {
    const response = await fetch(`/cliente/${c.id}/status`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      fecharModal("modalAcoes");
      carregarClientesDaAPI();
    }
  } catch (error) {
    console.error(error);
  }
}

function confirmarExclusao() {
  const ids = Array.from(document.querySelectorAll(".check-linha:checked"))
      .map(cb => parseInt(cb.dataset.id));
  const qtd = ids.length;
  window._idsParaExcluir = ids;
  const modalTexto = document.getElementById("modalExcluirTexto");
  if (modalTexto) {
    modalTexto.textContent = `Excluir ${qtd} cliente${qtd > 1 ? "s" : ""}? Esta ação não pode ser desfeita.`;
  }
  fecharModal("modalAcoes");
  document.getElementById("modalConfirmarExcluir").classList.add("aberto");
}

//Deleta no banco
async function executarExclusao() {
  const ids = window._idsParaExcluir || [];
  if (ids.length === 0) return;
  const token = sessionStorage.getItem("meuTccToken");

  try {
    const promessas = ids.map(id =>
        fetch(`/cliente/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
    );
    await Promise.all(promessas);
    const checkTodos = document.getElementById("checkTodos");
    if (checkTodos) checkTodos.checked = false;
    fecharModal("modalConfirmarExcluir");
    carregarClientesDaAPI();
  } catch (error) {
    console.error(error);
  }
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("aberto");
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    fecharModal(e.target.id);
  }
});

// Form de atualizar
const formAtualizar = document.getElementById("formAtualizar");
if (formAtualizar) {
  formAtualizar.addEventListener("submit", function(event) {
    event.preventDefault();
    salvarAtualizacao();
  });
}

// Permissões de botões baseadas no Cargo
(function controlarBotoesCliente() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  if (cargo !== "proprietaria") {
    const btnExcluir = document.getElementById("btnExcluir");
    if (btnExcluir) btnExcluir.style.display = "none";
  }
})();

// Inicializa a tela puxando do banco de dados
carregarPerfil();
carregarClientesDaAPI();