/* LANÇAMENTO-PRODUTOS.JS — INTEGRADO COM SPRING BOOT */

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
  const nome  = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";
  document.getElementById("avatar").textContent = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent = nome;
  document.getElementById("perfilEmail").textContent = email;
}

// SAUDAÇÃO
function saudacao() {
  const el = document.getElementById("saudacaoTexto");
  if (!el) return;
  const h = new Date().getHours();
  el.textContent = h < 12 ? "Bom dia!" : h < 18 ? "Boa tarde!" : "Boa noite!";
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
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

let tipoAtual = null;

// POPUP
function abrirPopup(tipo) {
  const rawVal = parseFloat(document.getElementById("valor-input").value);

  if (!rawVal || rawVal <= 0) {
    mostrarToast("⚠️ Digite um valor válido");
    return;
  }

  tipoAtual = tipo;

  document.getElementById("popupBadge").className  = "popup-badge " + tipo;
  document.getElementById("popupIcone").className  = tipo === "entrada" ? "fa-solid fa-arrow-up" : "fa-solid fa-arrow-down";
  document.getElementById("popupTitulo").textContent = tipo === "entrada" ? "Confirmar entrada" : "Confirmar saída";
  document.getElementById("popupValorDisplay").textContent = "R$ " + rawVal.toFixed(2).replace(".", ",");
  document.getElementById("popupBtnConfirmar").className = "popup-btn-confirmar " + tipo;

  document.getElementById("popup-notas").value = "";
  document.getElementById("popupOverlay").showOcultar || document.getElementById("popupOverlay").classList.add("show");
}

function fecharPopup() {
  document.getElementById("popupOverlay").classList.remove("show");
  tipoAtual = null;
}

document.getElementById("popupOverlay").addEventListener("click", function (e) {
  if (e.target === this) fecharPopup();
});

async function confirmar() {
  const valorInput = parseFloat(document.getElementById("valor-input").value);
  const notas = document.getElementById("popup-notas").value.trim();
  const token = sessionStorage.getItem("meuTccToken");

  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "../../login/login.html";
    return;
  }

  // Payload montado com a categoria COSMETICO esperada pelo seu Enum Java
  const lancamentoDTO = {
    descricao: notas || "Lançamento de Produto Manual",
    valor: valorInput,
    tipo: tipoAtual.toUpperCase(), // ENTRADA ou SAIDA
    categoria: "COSMETICO"          // Enum CategoriaDeLancamento.COSMETICO
  };

  try {
    const response = await fetch("/financeiro/manual", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(lancamentoDTO)
    });

    if (response.ok) {
      fecharPopup();
      document.getElementById("valor-input").value = "";

      const msgSucesso = tipoAtual === "entrada" ? "✅ Entrada de cosmético salva!" : "✅ Saída de cosmético salva!";
      mostrarToast(msgSucesso);
    } else {
      const textoErro = await response.text();
      alert(`Erro do servidor ao salvar: ${textoErro}`);
    }
  } catch (error) {
    console.error("Erro no POST de finanças/produtos:", error);
    mostrarToast("❌ Erro de conexão com o servidor.");
  }
}

function irParaRelatorio() {
  window.location.href = "../relatorio-produtos/relatorio-produtos.html";
}

function irParaListar() {
  window.location.href = "../listar-produtos/listar-produtos.html";
}

document.getElementById("valor-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") abrirPopup("entrada");
});

window.addEventListener("load", function () {
  carregarPerfil();
  saudacao();
});