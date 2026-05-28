/* CADASTRAR_SERVICO.JS */

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

// FORMATAR PREÇO — só números, exibe como 1.200,50
function formatarPreco(input) {
  let valor = input.value.replace(/\D/g, "");
  if (valor === "") { input.value = ""; return; }
  let num = parseInt(valor, 10);
  let inteiro = Math.floor(num / 100);
  let centavos = String(num % 100).padStart(2, "0");
  input.value = inteiro.toLocaleString("pt-BR") + "," + centavos;
}

// Converte "1.200,50" → 1200.50
function precoParaFloat(valor) {
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

document.getElementById("formCadastro").addEventListener("submit", function(e) {
  e.preventDefault();
  validarECadastrar();
});

function validarECadastrar() {
  const nome     = document.getElementById("nome").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const precoStr  = document.getElementById("preco").value.trim();
  const msg       = document.getElementById("msgCadastro");
  msg.classList.remove("show", "sucesso", "erro");

  if (!nome || !descricao || !precoStr) {
    msg.textContent = "Preencha todos os campos!";
    msg.classList.add("show", "erro");
    return;
  }

  // Converte corretamente de "1.200,50" para 1200.50
  const precoFloat = precoParaFloat(precoStr);
  if (precoFloat <= 0) {
    msg.textContent = "Digite um preço válido!";
    msg.classList.add("show", "erro");
    return;
  }

  const dados = { nome, descricao, preco: precoFloat };
  console.log("Enviando para backend:", dados);

  setTimeout(() => {
    document.getElementById("modalSucesso").classList.add("aberto");
  }, 500);
}

function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
  document.getElementById("formCadastro").reset();
}

window.addEventListener("load", carregarPerfil);
