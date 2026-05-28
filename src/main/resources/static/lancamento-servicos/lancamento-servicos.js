
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
  if (e.key === "Escape") { fecharMenu(); fecharPopup(); }
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
    // Comente a linha abaixo enquanto testa sem login:
    window.location.href = "../login/login.html"; // Redireciona se não estiver logado
  }
}

// PERMISSÕES 
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

// TOAST 
function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// TRANSAÇÕES (persiste na sessão) 
const CHAVE_STORAGE = "transacoes_servicos";

let transacoes = (function () {
  try { return JSON.parse(sessionStorage.getItem(CHAVE_STORAGE)) || []; }
  catch (e) { return []; }
})();

let proximoId = transacoes.length > 0
  ? Math.max(...transacoes.map(t => t.id || 0)) + 1
  : 1;

// POPUP 
let tipoAtual = null;

function abrirPopup(tipo) {
  const rawVal = parseFloat(document.getElementById("valor-input").value);

  if (!rawVal || rawVal <= 0) {
    mostrarToast("⚠️ Digite um valor válido");
    return;
  }

  tipoAtual = tipo;

  // Atualiza visual do popup conforme o tipo
  document.getElementById("popupBadge").className  = "popup-badge " + tipo;
  document.getElementById("popupIcone").className  = tipo === "entrada"
    ? "fa-solid fa-arrow-up"
    : "fa-solid fa-arrow-down";
  document.getElementById("popupTitulo").textContent =
    tipo === "entrada" ? "Confirmar entrada" : "Confirmar saída";
  document.getElementById("popupValorDisplay").textContent =
    "R$ " + rawVal.toFixed(2).replace(".", ",");
  document.getElementById("popupBtnConfirmar").className =
    "popup-btn-confirmar " + tipo;

  document.getElementById("popup-notas").value = "";
  document.getElementById("popupOverlay").classList.add("show");
}

function fecharPopup() {
  document.getElementById("popupOverlay").classList.remove("show");
  tipoAtual = null;
}

// Fechar clicando fora da caixa do popup
document.getElementById("popupOverlay").addEventListener("click", function (e) {
  if (e.target === this) fecharPopup();
});

//  CONFIRMAR TRANSAÇÃO 
function confirmar() {
  const valor = parseFloat(document.getElementById("valor-input").value);
  const notas = document.getElementById("popup-notas").value.trim();

  const now  = new Date();
  const data =
    now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " · " +
    now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // Adiciona a transação na lista e salva na sessão
  transacoes.unshift({ id: proximoId++, tipo: tipoAtual, valor, notas, data });
  sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(transacoes));

  fecharPopup();
  document.getElementById("valor-input").value = "";

  const msg = tipoAtual === "entrada" ? "✅ Entrada registrada!" : "✅ Saída registrada!";
  mostrarToast(msg);
}

// NAVEGAR PARA O RELATÓRIO 
function irParaRelatorio() {
  window.location.href = "../relatorio-servicos/relatorio-servicos.html";
}

// NAVEGAR PARA O Listar 
function irParaListar() {
  window.location.href = "../listar-servicos/listar-servicos.html";
}

// ENTER NO INPUT → abre popup entrada 
document.getElementById("valor-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") abrirPopup("entrada");
});

// INICIALIZA 
carregarPerfil();
