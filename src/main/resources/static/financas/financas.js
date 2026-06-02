// Lógica da tela principal de finanças integrada com o Spring Boot

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
  const nome = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";
  document.getElementById("avatar").textContent = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent = nome;
  document.getElementById("perfilEmail").textContent = email;
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


let lancamentos = []; // Armazenará os dados vindos do MySQL

async function carregarDadosFinanceirosDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) return;

  try {
    const response = await fetch("/financeiro", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      lancamentos = await response.json();

    } else {
      console.error("Erro ao buscar dados financeiros do banco.");
    }
  } catch (error) {
    console.error("Erro de conexão com o servidor:", error);
  }
}

// Card 1: Filtra e exibe os lançamentos cadastrados HOJE
function carregarLucroDia() {
  const lista = document.getElementById("listaLucroDia");
  if (!lista) return;
  lista.innerHTML = "";

  const hoje = new Date();

  // Filtra lançamentos que aconteceram na data de hoje
  const lancamentosHoje = lancamentos.filter(l => {
    const dataLanc = new Date(l.data);
    return dataLanc.getDate() === hoje.getDate() &&
        dataLanc.getMonth() === hoje.getMonth() &&
        dataLanc.getFullYear() === hoje.getFullYear();
  });

  // Calcula o total do dia (Somando receitas/entradas)
  const total = lancamentosHoje.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

  // Linha do TOTAL NO TOPO
  const liTotal = document.createElement("li");
  liTotal.className = "card-item";
  liTotal.style.cssText = "justify-content:space-between; padding-bottom:6px; border-bottom:1.5px solid var(--rose-gold); margin-bottom:6px;";
  liTotal.innerHTML = `
    <span class="card-item-nome" style="font-weight:700; font-size:0.82rem;">Total do Dia</span>
    <span class="card-item-hora" style="font-weight:700; font-size:0.88rem; color:var(--rose-gold-dark);">
      R$ ${total.toFixed(2).replace(".", ",")}
    </span>
  `;
  lista.appendChild(liTotal);

  // Lista cada lançamento individual de hoje
  if (lancamentosHoje.length === 0) {
    const liVazio = document.createElement("li");
    liVazio.className = "card-item";
    liVazio.innerHTML = `<span style="font-size:0.75rem; color:var(--text-soft)">Nenhum lançamento hoje.</span>`;
    lista.appendChild(liVazio);
    return;
  }

  lancamentosHoje.forEach(l => {
    const li = document.createElement("li");
    li.className = "card-item";
    li.innerHTML = `
      <div class="card-item-texto" style="flex-direction:row; align-items:center; justify-content:space-between; width:100%;">
        <span class="card-item-nome" style="font-size:0.78rem;">${l.descricao || 'Lançamento sem descrição'}</span>
        <span class="card-item-hora" style="font-weight:600; color:var(--rose-gold-dark); flex-shrink:0;">
          R$ ${parseFloat(l.valor).toFixed(2).replace(".", ",")}
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

// Card 2: Filtra e exibe o faturamento aglomerado por CATEGORIA no MÊS ATUAL
function carregarLucroMes() {
  const lista = document.getElementById("listaLucroMes");
  if (!lista) return;
  lista.innerHTML = "";

  const hoje = new Date();

  // Filtra lançamentos do mês e ano atual
  const lancamentosMes = lancamentos.filter(l => {
    const dataLanc = new Date(l.data);
    return dataLanc.getMonth() === hoje.getMonth() &&
        dataLanc.getFullYear() === hoje.getFullYear();
  });

  const totalGeral = lancamentosMes.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

  // Total geral no topo
  const liTotal = document.createElement("li");
  liTotal.className = "card-item";
  liTotal.style.cssText = "justify-content:space-between; padding-bottom:6px; border-bottom:1.5px solid var(--rose-gold); margin-bottom:4px;";
  liTotal.innerHTML = `
    <span class="card-item-nome" style="font-weight:700; font-size:0.82rem;">Total do Mês</span>
    <span class="card-item-hora" style="font-weight:700; font-size:0.88rem; color:var(--rose-gold-dark);">
      R$ ${totalGeral.toFixed(2).replace(".", ",")}
    </span>
  `;
  lista.appendChild(liTotal);

  // Agrupa os valores por categoria do seu Enum do Java (ex: SERVICO, PRODUTO, PESSOAL)
  const categoriasAgrupadas = {};
  lancamentosMes.forEach(l => {
    const catNome = l.categoria || "OUTROS";
    if (!categoriasAgrupadas[catNome]) {
      categoriasAgrupadas[catNome] = { valor: 0, qtd: 0 };
    }
    categoriasAgrupadas[catNome].valor += parseFloat(l.valor);
    categoriasAgrupadas[catNome].qtd += 1;
  });

  // Renderiza a soma de cada categoria na lista
  const chaves = Object.keys(categoriasAgrupadas);
  if (chaves.length === 0) {
    const liVazio = document.createElement("li");
    liVazio.className = "card-item";
    liVazio.innerHTML = `<span style="font-size:0.75rem; color:var(--text-soft)">Nenhum registro este mês.</span>`;
    lista.appendChild(liVazio);
    return;
  }

  chaves.forEach(cat => {
    const li = document.createElement("li");
    li.className = "card-item";

    // Deixa o nome da categoria mais legível na tela
    let nomeExibicao = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

    li.innerHTML = `
      <span class="card-item-hora" style="font-weight:600; color:var(--rose-gold-dark);">
        R$ ${categoriasAgrupadas[cat].valor.toFixed(2).replace(".", ",")}
      </span>
      <div class="card-item-texto">
        <span class="card-item-nome">${nomeExibicao}</span>
        <span class="card-item-servico">${categoriasAgrupadas[cat].qtd} lançamentos</span>
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

// Inicialização da página
carregarPerfil();
carregarDadosFinanceirosDaAPI();