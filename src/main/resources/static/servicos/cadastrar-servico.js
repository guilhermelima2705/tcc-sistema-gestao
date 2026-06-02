/* CADASTRAR_SERVICO.JS  */

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
  const nome = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";
  document.getElementById("avatar").textContent = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent = nome;
  document.getElementById("perfilEmail").textContent = email;
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

document.getElementById("formCadastro").addEventListener("submit", function(e) {
  e.preventDefault();
  validarECadastrar();
});

// FUNÇÃO DE CADASTRO REAL CONECTADA AO SPRING BOOT
async function validarECadastrar() {
  const nome           = document.getElementById("nome").value.trim();
  const duracaoMinutos = parseInt(document.getElementById("duracaoMinutos").value);
  const precoStr       = document.getElementById("preco").value.trim();
  const descricao      = document.getElementById("descricao").value.trim();
  const msg            = document.getElementById("msgCadastro");

  msg.className = "msg";
  msg.textContent = "";

  if (!nome || !duracaoMinutos || !precoStr) {
    msg.textContent = "Preencha todos os campos!";
    msg.classList.add("show", "erro");
    return;
  }

  const precoFloat = precoParaFloat(precoStr);
  if (precoFloat <= 0) {
    msg.textContent = "Digite um preço válido!";
    msg.classList.add("show", "erro");
    return;
  }

  const token = sessionStorage.getItem("meuTccToken");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "../login/login.html";
    return;
  }

  // Mapeado perfeitamente com o seu ServicoDto do Java
  const dadosServicoDTO = {
    nome: nome,
    valor: precoFloat,
    duracaoMinutos: duracaoMinutos,
    descricao: descricao
  };

  try {
    const response = await fetch("/servico", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosServicoDTO)
    });

    if (response.ok || response.status === 201) {
      document.getElementById("modalSucesso").classList.add("aberto");
    } else {
      const textoErro = await response.text();
      msg.textContent = `Erro do servidor: ${textoErro}`;
      msg.classList.add("show", "erro");
    }
  } catch (error) {
    console.error("Erro ao cadastrar serviço:", error);
    msg.textContent = "Erro de conexão com o servidor.";
    msg.classList.add("show", "erro");
  }
}

function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
  document.getElementById("formCadastro").reset();
  window.location.href = "servico.html";
}

window.addEventListener("load", carregarPerfil);