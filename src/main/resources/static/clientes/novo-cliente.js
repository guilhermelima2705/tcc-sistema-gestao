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
  if (e.key === "Escape") fecharMenu();
});

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
  const nome  = sessionStorage.getItem("usuarioNome")  || "Carmem Lúcia";
  const email = sessionStorage.getItem("usuarioEmail") || "admin@gmail.com";
  document.getElementById("avatar").textContent     = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email;
}

// Limpar formulário
function limparFormulario() {
  document.getElementById("nome").value         = "";
  document.getElementById("telefone").value     = "";
  document.getElementById("observacoes").value  = "";
  const msg = document.getElementById("msgCadastro");
  msg.className   = "msg";
  msg.textContent = "";
}

// Fechar o pop-up de sucesso (botão X)
function fecharPopup() {
  document.getElementById("popupSucesso").classList.remove("aberto");
}

// Cadastrar cliente
async function cadastrarCliente() {
  const nome     = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const msg      = document.getElementById("msgCadastro");

  // --- ALTERAÇÃO: Captura a nova data de nascimento do HTML ---
  const dataNascimento = document.getElementById("data_nascimento").value;

  msg.className   = "msg";
  msg.textContent = "";

  const numerosApenas = telefone.replace(/\D/g, "");

  if (numerosApenas.length < 10 || numerosApenas.length > 11) {
    msg.textContent = "Digite um telefone válido (10 ou 11 dígitos).";
    msg.classList.add("erro");
    return;
  }

  if (!nome) {
    msg.textContent = "O nome é obrigatório.";
    msg.classList.add("erro");
    return;
  }

  // --- ALTERAÇÃO: Validação da nova data antes de enviar pro Java ---
  if (!dataNascimento) {
    msg.textContent = "A data de nascimento é obrigatória.";
    msg.classList.add("erro");
    return;
  }

  // --- ALTERAÇÃO: Recupera o Token JWT e envia os dados para o Spring Boot ---
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "../login/login.html";
    return;
  }

  msg.textContent = "Salvando cliente no banco de dados...";
  msg.style.color = "blue";

  const dadosClienteDTO = {
    nome: nome,
    telefone: telefone,
    observacoes: document.getElementById("observacoes").value.trim(),
    cpf: null,
    dataNascimento: dataNascimento
  };

  try {
    const response = await fetch("/cliente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosClienteDTO)
    });

    if (response.ok) {
      msg.textContent = "";

      // Abre o pop-up de sucesso
      document.getElementById("popupSucesso").classList.add("aberto");

      limparFormulario();
      if(document.getElementById("data_nascimento")) document.getElementById("data_nascimento").value = "";
    } else {
      const textoErro = await response.text();
      msg.textContent = `Erro do servidor: ${textoErro}`;
      msg.classList.add("erro");
      msg.style.color = "red";
    }

  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    msg.textContent = "Erro de conexão com o servidor.";
    msg.classList.add("erro");
    msg.style.color = "red";
  }
}

// Compartilhar link da página de agendamento do cliente
// Troque a URL abaixo pelo endereço real da sua página de agendamento
function compartilharLink() {
  const linkAgendamento = "https://seudominio.com.br/agendamento/agendamento-cliente.html";
  const texto = "Faça seu agendamento no Espaço Carmem Lúcia: " + linkAgendamento;

  // Tenta usar a API nativa de compartilhamento do celular (WhatsApp, etc.)
  if (navigator.share) {
    navigator.share({
      title: "Agendamento — Espaço Carmem Lúcia",
      text: "Faça seu agendamento no Espaço Carmem Lúcia!",
      url: linkAgendamento
    }).catch(function(err) {
      // Usuário cancelou ou ocorreu erro — não faz nada
      console.log("Compartilhamento cancelado:", err);
    });
  } else {
    // Fallback: copia o link para a área de transferência
    navigator.clipboard.writeText(linkAgendamento).then(function() {
      alert("Link copiado! Cole no WhatsApp ou onde preferir:\n" + linkAgendamento);
    }).catch(function() {
      // Último recurso: abre o WhatsApp Web com o link
      const urlWhatsApp = "https://wa.me/?text=" + encodeURIComponent(texto);
      window.open(urlWhatsApp, "_blank");
    });
  }
}

// Máscara de telefone
document.addEventListener("DOMContentLoaded", function() {
  const telInput = document.getElementById("telefone");
  if (telInput) {
    telInput.addEventListener("input", function() {
      let v = this.value.replace(/\D/g, "");
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      }
      this.value = v;
    });
  }
});

// Permissões - esconde itens do menu restritos para funcionária
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

// event.preventDefault() trava refresh
const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", function(event) {
    event.preventDefault();
    cadastrarCliente();
  });
}

// Inicializa
carregarPerfil();
