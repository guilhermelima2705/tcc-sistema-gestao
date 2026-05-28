// MENU E NAVEGAÇÃO 
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

//  AVATAR / PERFIL 
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
  const nome  = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");
  if (nome) {
    document.getElementById("avatar").textContent      = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent  = nome;
    document.getElementById("perfilEmail").textContent = email || "";
  } else {
    window.location.href = "../login/login.html";
  }
}

// DADOS DOS SERVIÇOS 
let servicos = [
  { id: 1, nome: "Corte de Cabelo", preco: "80.00", descricao: "Corte profissional com acabamento impecável", ativo: true },
  { id: 2, nome: "Escova Progressiva", preco: "150.00", descricao: "Tratamento capilar com progressiva premium", ativo: true },
  { id: 3, nome: "Manicure", preco: "50.00", descricao: "Manicure completa com acabamento perfeito", ativo: true }
];

let servicoSelecionadoAtualizar = null;
let servicosSelecionados = [];

// RENDERIZAR TABELA
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

    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${s.id}" onchange="atualizarBotoes()" />
      </td>
      <td>${s.nome}</td>
      <td class="valor-servico">R$ ${parseFloat(s.preco).toFixed(2)}</td>
      <td>${s.descricao}</td>
    `;
    corpo.appendChild(tr);
  });
}

// PESQUISA E FILTRO
function filtrarServicos() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  
  const filtrados = servicos.filter(s =>
    s.nome.toLowerCase().includes(termo) ||
    s.descricao.toLowerCase().includes(termo)
  );

  renderizarTabela(filtrados);
}

//  CHECKBOXES 
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
    servicosSelecionados.push(servicos.find(s => s.id === id));
  });

  document.getElementById("btnAtualizar").disabled = servicosSelecionados.length !== 1;
  document.getElementById("btnExcluir").disabled = servicosSelecionados.length === 0;
}

//MODAL - ATUALIZAR
function abrirModalAtualizar() {
  if (servicosSelecionados.length !== 1) {
    return; // botão fica disabled, mas por segurança retorna sem alert
  }

  servicoSelecionadoAtualizar = servicosSelecionados[0];

  // Preenche o campo de valor sem R$ — só o número formatado ex: "80,00"
  const precoFormatado = parseFloat(servicoSelecionadoAtualizar.preco)
    .toFixed(2)
    .replace(".", ",");
  document.getElementById("editNome").value    = servicoSelecionadoAtualizar.nome;
  document.getElementById("editValor").value   = precoFormatado;
  document.getElementById("editDescricao").value = servicoSelecionadoAtualizar.descricao;

  abrirModal("modalAtualizar");
}

function confirmarAtualizacao() {
  if (!servicoSelecionadoAtualizar) return;

  // Usa precoParaFloat para converter "1.200,50" → 1200.50 corretamente
  const precoFloat = precoParaFloat(document.getElementById("editValor").value);

  const dados = {
    id: servicoSelecionadoAtualizar.id,
    nome: document.getElementById("editNome").value.trim(),
    preco: precoFloat,
    descricao: document.getElementById("editDescricao").value.trim()
  };

  console.log("Enviando pra backend (ATUALIZAR SERVIÇO):", dados);

  // Atualiza localmente (simulação — futuramente chama a API)
  servicoSelecionadoAtualizar.nome      = dados.nome;
  servicoSelecionadoAtualizar.preco     = dados.preco.toFixed(2);
  servicoSelecionadoAtualizar.descricao = dados.descricao;

  renderizarTabela(servicos);
  fecharModal("modalAtualizar");
  mostrarToast("✓ Serviço atualizado com sucesso!", "sucesso");
}
//  MODAL - EXCLUIR 
function abrirModalExcluir() {
  if (servicosSelecionados.length === 0) {
    return; // botão fica disabled, mas por segurança retorna sem alert
  }

  const nomes = servicosSelecionados.map(s => s.nome).join(", ");
  document.getElementById("textoExcluir").textContent = 
    `Tem certeza que deseja excluir: ${nomes}?`;

  abrirModal("modalExcluir");
}

function confirmarExclusao() {
  const dados = {
    ids: servicosSelecionados.map(s => s.id)
  };

  console.log("Enviando pra backend (DELETAR SERVIÇO):", dados);

  // Simulação
  servicos = servicos.filter(s => !dados.ids.includes(s.id));

  renderizarTabela(servicos);
  fecharModal("modalExcluir");
  limparCheckboxes();
  // Toast estilizado substitui o alert() preto do navegador
  mostrarToast("🗑  Serviço excluído com sucesso!", "sucesso");
}

//  MODAIS 
function abrirModal(id) {
  document.getElementById(id).classList.add("aberto");
}

function fecharModal(id) {
  document.getElementById(id).classList.remove("aberto");
}

function limparCheckboxes() {
  document.getElementById("checkTodos").checked = false;
  document.querySelectorAll(".check-linha").forEach(check => check.checked = false);
  atualizarBotoes();
}

// FORMATAR PREÇO — aceita só números, exibe como 1.200,50 (sem R$)
// O R$ aparece só no placeholder e na tabela — input fica limpo para edição
function formatarPreco(input) {
  // Remove tudo que não for dígito
  let valor = input.value.replace(/\D/g, "");
  if (valor === "") {
    input.value = "";
    return;
  }
  // Converte centavos: 12050 → "120,50"
  let num = parseInt(valor, 10);
  // Formata com separador de milhar e vírgula decimal
  let inteiro = Math.floor(num / 100);
  let centavos = String(num % 100).padStart(2, "0");
  let inteiroFormatado = inteiro.toLocaleString("pt-BR");
  input.value = inteiroFormatado + "," + centavos;
}

// Converte o valor formatado "1.200,50" de volta para float 1200.50
function precoParaFloat(valor) {
  return parseFloat(
    valor.replace(/\./g, "").replace(",", ".")
  ) || 0;
}
window.addEventListener("load", function () {
  carregarPerfil();
  renderizarTabela(servicos);
});

// Captura o submit do form de atualização 
const formAtualizar = document.getElementById("formAtualizar");
if (formAtualizar) {
  formAtualizar.addEventListener("submit", function(e) {
    e.preventDefault();
    confirmarAtualizacao();
  });
} else {
  console.log("Form não encontrado - verificando novamente...");
  // Tenta novamente quando o DOM carregar
  document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formAtualizar");
    if (form) {
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        confirmarAtualizacao();
      });
    }
  });
}