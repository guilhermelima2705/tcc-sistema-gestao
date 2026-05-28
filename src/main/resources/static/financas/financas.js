// FINANCAS.JS
// Lógica da tela principal de finanças.

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
  const nome = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");
  if (nome) {
    document.getElementById("avatar").textContent = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent = nome;
    document.getElementById("perfilEmail").textContent = email || "";
  } else {
    window.location.href = "../login/login.html";
  }
}

// Permissões 
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const restritos = ["funcionarios.html", "servico.html"];
    if (restritos.some(r => link.getAttribute("href") && link.getAttribute("href").includes(r)))
      link.closest("li").style.display = "none";
  });
})();

//  Meus Ganhos (card 1) 
// Mostra apenas os ganhos da proprietária (Carmem).
// Total aparece no TOPO (igual ao segundo card).
function carregarLucroDia() {
  const lista = document.getElementById("listaLucroDia");
  if (!lista) return;
  lista.innerHTML = "";

  // Serviços realizados pela Carmem no dia (futuramente virá do banco)
  const servicosCarmem = [
    { servico: "Escova Progressiva", valor: 150.00 },
    { servico: "Corte de Cabelo", valor: 80.00 },
    { servico: "Coloração", valor: 200.00 },
    { servico: "Manicure", valor: 50.00 },
  ];

  const total = servicosCarmem.reduce((s, i) => s + i.valor, 0);

  // TOTAL NO TOPO 
  const liTotal = document.createElement("li");
  liTotal.className = "card-item";
  liTotal.style.cssText = "justify-content:space-between; padding-bottom:6px; border-bottom:1.5px solid var(--rose-gold); margin-bottom:6px;";
  liTotal.innerHTML = `
    <span class="card-item-nome" style="font-weight:700; font-size:0.82rem;">Total</span>
    <span class="card-item-hora" style="font-weight:700; font-size:0.88rem; color:var(--rose-gold-dark);">
      R$ ${total.toFixed(2).replace(".", ",")}
    </span>
  `;
  lista.appendChild(liTotal);

  // Depois cada serviço
  servicosCarmem.forEach(s => {
    const li = document.createElement("li");
    li.className = "card-item";
    li.innerHTML = `
      <div class="card-item-texto" style="flex-direction:row; align-items:center; justify-content:space-between; width:100%;">
        <span class="card-item-nome" style="font-size:0.78rem;">${s.servico}</span>
        <span class="card-item-hora" style="font-weight:600; color:var(--rose-gold-dark); flex-shrink:0;">
          R$ ${s.valor.toFixed(2).replace(".", ",")}
        </span>
      </div>
    `;
    lista.appendChild(li);
  });
}

function toggleLucroDia() {
  const el = document.getElementById("listaLucroDia");
  const icone = document.getElementById("iconOlhoDia");
  if (icone.classList.contains("fa-eye")) {
    el.innerHTML = "";
    icone.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    carregarLucroDia();
    icone.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// Lucro do Salão (card 2) 
// Proprietária vê todos os profissionais + total geral no topo.
function carregarLucroMes() {
  const lista = document.getElementById("listaLucroMes");
  if (!lista) return;
  lista.innerHTML = "";

  const cargo = sessionStorage.getItem("usuarioCargo");
  const lucroDados = [
    { nome: "Carmem", valor: 4200.00, servicos: "28 serviços" },
    { nome: "Erika", valor: 1800.00, servicos: "14 serviços" }
  ];
  const mostra = cargo === "proprietaria" ? lucroDados : [lucroDados[1]];

  // Total geral no topo
  const total = mostra.reduce((s, l) => s + l.valor, 0);
  const liTotal = document.createElement("li");
  liTotal.className = "card-item";
  liTotal.style.cssText = "justify-content:space-between; padding-bottom:6px; border-bottom:1.5px solid var(--rose-gold); margin-bottom:4px;";
  liTotal.innerHTML = `
    <span class="card-item-nome" style="font-weight:700; font-size:0.82rem;">Total</span>
    <span class="card-item-hora" style="font-weight:700; font-size:0.88rem; color:var(--rose-gold-dark);">
      R$ ${total.toFixed(2).replace(".", ",")}
    </span>
  `;
  lista.appendChild(liTotal);

  // Detalhes por profissional
  mostra.forEach(l => {
    const li = document.createElement("li");
    li.className = "card-item";
    li.innerHTML = `
      <span class="card-item-hora" style="font-weight:600; color:var(--rose-gold-dark);">
        R$ ${l.valor.toFixed(2).replace(".", ",")}
      </span>
      <div class="card-item-texto">
        <span class="card-item-nome">${l.nome}</span>
        <span class="card-item-servico">${l.servicos}</span>
      </div>
    `;
    lista.appendChild(li);
  });
}

function toggleLucroMes() {
  const el = document.getElementById("listaLucroMes");
  const icone = document.getElementById("iconOlhoMes");
  if (icone.classList.contains("fa-eye")) {
    el.innerHTML = "";
    icone.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    carregarLucroMes();
    icone.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// nicializa
carregarPerfil();