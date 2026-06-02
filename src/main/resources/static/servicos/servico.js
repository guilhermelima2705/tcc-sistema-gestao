/* SERVICO.JS — INTEGRADO COM BACKEND */

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
    fecharModal("modalExcluir");
  }
});

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
  document.getElementById("avatar").textContent = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent = nome;
  document.getElementById("perfilEmail").textContent = email;
}

let servicos = []; // Começa vazio e o Spring Boot preenche
let servicoSelecionadoAtualizar = null;
let servicosSelecionados = [];

// 1. BUSCA REAL DOS SERVIÇOS DO BANCO (GET)
async function carregarServicosDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) return;

  try {
    const response = await fetch("/servico", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      servicos = await response.json();
      renderizarTabela(servicos);
    } else {
      console.error("Erro ao buscar serviços no banco de dados.");
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

// 2. RENDERIZA A TABELA COM TODAS AS COLUNAS
function renderizarTabela(lista) {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");

  if (!corpo) return;
  corpo.innerHTML = "";

  if (lista.length === 0) {
    vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  vazia.style.display = "none";

  lista.forEach(s => {
    const tr = document.createElement("tr");
    // Alinhado com as propriedades exatas do seu modelo Java
    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${s.id}" onchange="atualizarBotoes()" />
      </td>
      <td>${s.nome}</td>
      <td class="valor-servico">R$ ${parseFloat(s.valor).toFixed(2).replace(".", ",")}</td>
      <td>${s.duracaoMinutos || 0} min</td>
      <td>${s.descricao || "—"}</td>
    `;
    corpo.appendChild(tr);
  });
}

function filtrarServicos() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  const filtrados = servicos.filter(s =>
      s.nome.toLowerCase().includes(termo) ||
      (s.descricao && s.descricao.toLowerCase().includes(termo))
  );
  renderizarTabela(filtrados);
}

function toggleTodos(checkbox) {
  document.querySelectorAll(".check-linha").forEach(check => {
    check.checked = checkbox.checked;
  });
  atualizarBotoes();
}

function atualizarBotoes() {
  servicosSelecionados = [];
  document.querySelectorAll(".check-linha:checked").forEach(check => {
    const id = parseInt(check.dataset.id);
    const encontrado = servicos.find(s => s.id === id);
    if (encontrado) servicosSelecionados.push(encontrado);
  });

  document.getElementById("btnAtualizar").disabled = servicosSelecionados.length !== 1;
  document.getElementById("btnExcluir").disabled = servicosSelecionados.length === 0;
}

// 3. ABRE MODAL DE ATUALIZAÇÃO PREENCHIDO
function abrirModalAtualizar() {
  if (servicosSelecionados.length !== 1) return;
  servicoSelecionadoAtualizar = servicosSelecionados[0];

  const precoFormatado = parseFloat(servicoSelecionadoAtualizar.valor).toFixed(2).replace(".", ",");
  document.getElementById("editNome").value = servicoSelecionadoAtualizar.nome;
  document.getElementById("editValor").value = precoFormatado;
  document.getElementById("editDuracao").value = servicoSelecionadoAtualizar.duracaoMinutos || "";
  document.getElementById("editDescricao").value = servicoSelecionadoAtualizar.descricao || "";

  abrirModal("modalAtualizar");
}

// 4. ENVIA ATUALIZAÇÃO REAL PARA O BACKEND (PUT)
async function confirmarAtualizacao() {
  if (!servicoSelecionadoAtualizar) return;
  const token = sessionStorage.getItem("meuTccToken");

  const precoFloat = precoParaFloat(document.getElementById("editValor").value);
  const dadosDTO = {
    nome: document.getElementById("editNome").value.trim(),
    valor: precoFloat,
    duracaoMinutos: parseInt(document.getElementById("editDuracao").value),
    descricao: document.getElementById("editDescricao").value.trim()
  };

  try {
    const response = await fetch(`/servico/${servicoSelecionadoAtualizar.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosDTO)
    });

    if (response.ok || response.status === 204) {
      fecharModal("modalAtualizar");
      carregarServicosDaAPI(); // Recarrega a tabela do banco
    } else {
      alert("Erro ao atualizar o serviço no servidor.");
    }
  } catch (error) {
    console.error("Erro no PUT de serviços:", error);
  }
}

function abrirModalExcluir() {
  if (servicosSelecionados.length === 0) return;
  const nomes = servicosSelecionados.map(s => s.nome).join(", ");
  document.getElementById("textoExcluir").textContent = `Tem certeza que deseja excluir: ${nomes}?`;
  abrirModal("modalExcluir");
}

// 5. DELETA REAL DO BANCO DE DADOS (DELETE)
async function confirmarExclusao() {
  const token = sessionStorage.getItem("meuTccToken");
  const ids = servicosSelecionados.map(s => s.id);

  try {
    const promessas = ids.map(id =>
        fetch(`/servico/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
    );
    await Promise.all(promessas);

    fecharModal("modalExcluir");
    limparCheckboxes();
    carregarServicosDaAPI(); // Atualiza a lista
  } catch (error) {
    console.error("Erro ao deletar:", error);
    alert("Erro ao excluir serviço(s).");
  }
}

function abrirModal(id) { document.getElementById(id).classList.add("aberto"); }
function fecharModal(id) { document.getElementById(id).classList.remove("aberto"); }

function limparCheckboxes() {
  const checkTodos = document.getElementById("checkTodos");
  if (checkTodos) checkTodos.checked = false;
  document.querySelectorAll(".check-linha").forEach(check => check.checked = false);
  atualizarBotoes();
}

function formatarPreco(input) {
  let valor = input.value.replace(/\D/g, "");
  if (valor === "") { input.value = ""; return; }
  let num = parseInt(valor, 10);
  let inteiro = Math.floor(num / 100);
  let centavos = String(num % 100).padStart(2, "0");
  input.value = inteiro.toLocaleString("pt-BR") + "," + centavos;
}

function precoParaFloat(valor) {
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

// Inicialização corrigida chamando a API do Spring Boot
window.addEventListener("load", function () {
  carregarPerfil();
  carregarServicosDaAPI();
});

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("formAtualizar");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      confirmarAtualizacao();
    });
  }
});