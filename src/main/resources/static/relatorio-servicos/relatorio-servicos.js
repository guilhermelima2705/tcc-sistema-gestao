//  MENU LATERAL 
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

//  PERMISSÕES 
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

const CHAVE_STORAGE = "transacoes_servicos";

//  DADOS 
let transacoes = (function () {
  try {
    const salvo = JSON.parse(sessionStorage.getItem(CHAVE_STORAGE));
    if (salvo && salvo.length > 0) return salvo;
  } catch (e) { /* ignora */ }
  return [];
})();

let filtroAtivo = "todos";

//  FORMATAR VALOR 
function fmt(v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

// TOTAIS 
function atualizarTotais() {
  let somaE = 0, somaS = 0;
  transacoes.forEach(t => {
    if (t.tipo === "entrada") somaE += t.valor;
    else                      somaS += t.valor;
  });
  const saldo = somaE - somaS;

  document.getElementById("totalEntradas").textContent = fmt(somaE);
  document.getElementById("totalSaidas").textContent   = fmt(somaS);

  const elSaldo = document.getElementById("saldoLiquido");
  elSaldo.textContent = fmt(Math.abs(saldo));
  elSaldo.className   = "rel-saldo-valor " + (saldo >= 0 ? "positivo" : "negativo");
}

// FILTRO 
function setFiltro(tipo, btn) {
  filtroAtivo = tipo;
  document.querySelectorAll(".rel-filtro-btn").forEach(b => b.classList.remove("ativo"));
  btn.classList.add("ativo");
  aplicarFiltros();
}

//  PESQUISA + FILTRO 
function aplicarFiltros() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();

  const resultado = transacoes.filter(t => {
    const matchTipo  = filtroAtivo === "todos" || t.tipo === filtroAtivo;
    const matchTexto =
      (t.notas || "").toLowerCase().includes(termo) ||
      t.data.toLowerCase().includes(termo)          ||
      fmt(t.valor).includes(termo);
    return matchTipo && matchTexto;
  });

  renderizarLista(resultado);
}

// RENDERIZAR LISTA 
function renderizarLista(lista) {
  const container = document.getElementById("listaTransacoes");
  const vazia     = document.getElementById("listaVazia");

  container.innerHTML = "";

  if (lista.length === 0) {
    vazia.style.display = "block";
    atualizarBotaoExcluir();
    return;
  }
  vazia.style.display = "none";

  lista.forEach(t => {
    const div = document.createElement("div");
    div.className = "transacao-item " + t.tipo;

    div.innerHTML = `
      <input
        type="checkbox"
        class="transacao-check"
        data-id="${t.id}"
        onchange="atualizarBotaoExcluir()"
      />
      <div class="transacao-icone ${t.tipo}">
        <i class="fa-solid ${t.tipo === "entrada" ? "fa-arrow-up" : "fa-arrow-down"}"></i>
      </div>
      <div class="transacao-body">
        <div class="transacao-topo">
          <span class="transacao-valor ${t.tipo}">
            ${t.tipo === "entrada" ? "+" : "−"} ${fmt(t.valor)}
          </span>
          <span class="transacao-badge ${t.tipo}">
            ${t.tipo === "entrada" ? "Entrada" : "Saída"}
          </span>
        </div>
        <div class="transacao-data">${t.data}</div>
        ${t.notas
          ? `<div class="transacao-notas">${t.notas}</div>`
          : ""
        }
      </div>
    `;

    container.appendChild(div);
  });

  atualizarBotaoExcluir();
}

// BOTÃO EXCLUIR 
function atualizarBotaoExcluir() {
  const marcados = document.querySelectorAll(".transacao-check:checked").length;
  document.getElementById("btnExcluir").disabled = marcados === 0;
}

function excluirSelecionados() {
  const ids = Array.from(document.querySelectorAll(".transacao-check:checked"))
    .map(cb => parseInt(cb.dataset.id));

  if (ids.length === 0) return;
  
  window._idsParaExcluir = ids;
  document.getElementById("modalConfirmarExcluir").classList.add("aberto");
}

function executarExclusaoConfirmada() {
  const ids = window._idsParaExcluir || [];
  
  if (ids.length === 0) return;
  
  transacoes = transacoes.filter(t => !ids.includes(t.id));
  sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(transacoes));
  
  fecharModal("modalConfirmarExcluir");
  
  atualizarTotais();
  aplicarFiltros();
  
  window._idsParaExcluir = [];
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("aberto");
}

// INICIALIZA 
carregarPerfil();
atualizarTotais();
aplicarFiltros();