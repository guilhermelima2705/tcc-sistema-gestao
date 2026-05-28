/* LÓGICA DE LOGIN - VALIDAÇÃO E ENTRADA */
// Função para mostrar ou esconder a senha ao clicar no olho
function toggleSenha() {
  const input = document.getElementById("senha");
  const icone = document.getElementById("iconeOlho");
  if (input.type === "password") {
    input.type = "text";
    if (icone) icone.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    if (icone) icone.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// Evento de envio do formulário conectado à sua API Spring Boot
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha   = document.getElementById("senha").value.trim();
  const msg     = document.getElementById("msg");

  msg.className   = "msg";
  msg.textContent = "";

  // Verifica se os campos estão vazios
  if (!usuario || !senha) {
    msg.textContent = "Preencha todos os campos.";
    msg.classList.add("erro");
    return;
  }

  // Desabilita o botão para evitar múltiplos cliques
  const btnLogin = document.querySelector(".btn-login");
  btnLogin.disabled = true;
  btnLogin.textContent = "Entrando...";

  try {
    // Como o front e back estão no mesmo servidor, usamos a rota direta
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: usuario, senha: senha })
    });

    if (response.ok) {
      // 200 OK: Pega o token JWT gerado pelo AuthController
      const data = await response.json();

      // Guarda o Token de forma segura na sessão
      sessionStorage.setItem("meuTccToken", data.token);

      // Redireciona para a página inicial (mantendo o caminho da sua equipe)
      window.location.href = "/index-home/home.html";
    } else {
      // Erro 403 (Forbidden) por credenciais erradas
      msg.textContent = "E-mail ou senha incorretos.";
      msg.classList.add("erro");
    }
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    msg.textContent = "Erro ao conectar com o servidor.";
    msg.classList.add("erro");
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
});


/* ANIMAÇÃO DE PÉTALAS DELICADAS */

(function () {
  // Pétalas SOMENTE em telas grandes (PC/tablet ≥ 768px)
  // No mobile elas não aparecem para não interferir no layout
  if (window.innerWidth < 768) return;

  const canvas = document.createElement('canvas');
  // pointer-events:none garante que o canvas nunca bloqueie cliques nos inputs
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Calcula a altura do banner para as pétalas nascerem abaixo dele
  function alturaBanner() {
    return window.innerHeight * 0.38;
  }

  const cores = [
    'rgba(232, 196, 190,',
    'rgba(245, 215, 210,',
    'rgba(255, 235, 230,',
    'rgba(210, 175, 168,',
  ];

function criarPetala() {
    const larguraTela = window.innerWidth;
    return {
      /* Agora ela pode nascer em qualquer lugar, do pixel 0 até o final da tela */
      x:       Math.random() * larguraTela, 
      
      y:       alturaBanner() + Math.random() * 60,
      w:       4 + Math.random() * 5,
      h:       2.5 + Math.random() * 3,
      cor:     cores[Math.floor(Math.random() * cores.length)],
      alfa:    0.45 + Math.random() * 0.55,
      vy:      0.4 + Math.random() * 0.6,
      oscVel:  0.015 + Math.random() * 0.02,
      oscFase: Math.random() * Math.PI * 2,
      rotacao: Math.random() * Math.PI * 2,
      rotVel:  (Math.random() - 0.5) * 0.015,
    };
  }

  // Cria 18 pétalas
  const petalas = Array.from({ length: 20 }, () => {
    const p = criarPetala();
    p.y = alturaBanner() + Math.random() * (window.innerHeight - alturaBanner());
    return p;
  });

  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petalas.forEach(p => {
      p.oscFase += p.oscVel;
      p.x       += Math.sin(p.oscFase) * 0.5;
      p.y       += p.vy;
      p.rotacao += p.rotVel;

      if (p.y > window.innerHeight + 20) {
        Object.assign(p, criarPetala());
      }

      if (p.y < alturaBanner()) return;

      ctx.save();
      ctx.globalAlpha = p.alfa;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotacao);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.cor + p.alfa + ')';
      ctx.shadowColor = 'rgba(212, 161, 152, 0.3)';
      ctx.shadowBlur  = 4;
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(desenhar);
  }
  desenhar();
})();