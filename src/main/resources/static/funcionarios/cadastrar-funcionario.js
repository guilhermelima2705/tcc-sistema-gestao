//  MENU 
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

// AVATAR 
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

//  FORM SUBMIT 
document.getElementById("formCadastro").addEventListener("submit", function(e) {
  e.preventDefault();
  validarECadastrar();
});

async function validarECadastrar() {
  const nome  = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const papel = document.getElementById("papel").value;

  const msg = document.getElementById("msgCadastro");
  msg.className = "msg"; // Reseta classes
  msg.textContent = "";

  // 1. Validação simples do Front
  if (!nome || !email || !senha || !papel) {
    msg.textContent = "Preencha todos os campos!";
    msg.classList.add("show", "erro");
    return;
  }

  // 2. Recupera o Token JWT
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "../login/login.html";
    return;
  }

  msg.textContent = "Cadastrando funcionário...";
  msg.style.color = "blue";
  msg.classList.add("show");

  // 3. Monta o DTO exatamente com os campos que o FuncionarioDto do Java espera
  const dadosFuncionarioDTO = {
    nome: nome,
    email: email,
    senha: senha,
    papel: papel // O Enum CategoriaFuncionario aceita "ADMIN" ou "FUNCIONARIO" (ou o que você configurou)
  };

  try {
    // 4. Envia o POST para a API
    const response = await fetch("/funcionario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosFuncionarioDTO)
    });

    if (response.ok || response.status === 201) {
      msg.textContent = "";
      document.getElementById("modalSucesso").classList.add("aberto");
    } else {
      const textoErro = await response.text();
      msg.textContent = `Erro do servidor: ${textoErro}`;
      msg.classList.add("show", "erro");
      msg.style.color = "red";
    }

  } catch (error) {
    console.error("Erro ao cadastrar funcionário:", error);
    msg.textContent = "Erro de conexão com o servidor.";
    msg.classList.add("show", "erro");
    msg.style.color = "red";
  }
}

// Fechar Modal limpa o form e redireciona de volta para a listagem
function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
  document.getElementById("formCadastro").reset();
  window.location.href = "funcionarios.html";
}

// Máscara de telefone
document.querySelectorAll('input[id*="telefone"], input[name*="telefone"]').forEach(function(el) {
  el.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");
    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
    this.value = v;
  });
});

// Máscara de CPF
document.querySelectorAll('input[id*="cpf"], input[name*="cpf"]').forEach(function(el) {
  el.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");
    v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    this.value = v;
  });
});
