function enviarLink() {

  const emailInput = document.getElementById("emailRecupera").value.trim();
  const msgArea = document.getElementById("msgRecupera");
  const cardPrincipal = document.getElementById("cardRecuperar");

  const usuariosCadastrados = ["admin@gmail.com", "erika@gmail.com"];

  if (usuariosCadastrados.includes(emailInput.toLowerCase())) {
    
    cardPrincipal.innerHTML = `
      <div style="text-align:center; padding:20px;">
        <h2 style="font-family:'Cormorant Garamond',serif; font-size:1.3rem; margin-bottom:12px;">Link Enviado!</h2>
        <p style="font-size:0.85rem; color:var(--text-soft); margin-bottom:20px;">
          Enviamos as instruções para:<br><strong>${emailInput}</strong>
        </p>
        <button class="btn-form-cadastrar" onclick="window.location.href='login.html'" 
                style="width:100%; justify-content:center;">
          Voltar ao Login
        </button>
      </div>
    `;
  } else {
    msgArea.textContent = "E-mail não encontrado em nossa base.";
    msgArea.className = "msg erro";
    msgArea.style.display = "block";
  }
}

document.getElementById("recuperarForm").addEventListener("submit", function (e) {
  e.preventDefault();
  enviarLink();
});