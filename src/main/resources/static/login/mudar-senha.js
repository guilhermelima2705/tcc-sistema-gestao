// Lógica da tela de redefinição de senha.
// Mostrar/ocultar senha 
function toggleSenha(campoId, iconeId) {
  const campo = document.getElementById(campoId);
  const icone = document.getElementById(iconeId);
  if (campo.type === "password") {
    campo.type = "text";
    icone.classList.replace("fa-eye-slash", "fa-eye");
  } else {
    campo.type = "password";
    icone.classList.replace("fa-eye", "fa-eye-slash");
  }
}
//  Validar e salvar nova senha 
function mudarSenha() {
  const nova      = document.getElementById("novaSenha").value.trim();
  const confirmar = document.getElementById("confirmarSenha").value.trim();
  const msg       = document.getElementById("msgMudarSenha");

  msg.className   = "msg";
  msg.textContent = "";

  if (!nova || !confirmar) {
    msg.textContent = "Preencha todos os campos.";
    msg.classList.add("erro");
    return;
  }

  if (nova.length < 6) {
    msg.textContent = "A senha precisa ter pelo menos 6 caracteres.";
    msg.classList.add("erro");
    return;
  }

  if (nova !== confirmar) {
    msg.textContent = "As senhas não coincidem.";
    msg.classList.add("erro");
    return;
  }

  // Futuramente: enviar nova senha pro backend Java via fetch
  document.getElementById("modalSucesso").classList.add("aberto");
}

//  Fechar modal 
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    document.getElementById("modalSucesso").classList.remove("aberto");
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("modalSucesso").classList.remove("aberto");
  }
});
document.getElementById('formMudarSenha').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar (essencial para o Fetch)
    mudarSenha();           // Chama a sua função de validar
})