/* LISTAR-SERVICOS.JS — INTEGRADO COM SPRING BOOT */

// MENU / PERFIL
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });

function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}
document.addEventListener("click", () => {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

function gerarIniciais(nome) {
  if (!nome) return "?";
  const p = nome.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function carregarPerfil() {
  // Se não achar o nome no sistema, usa um valor padrão em vez de derrubar a tela
  const nome = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";

  const avatarEl = document.getElementById("avatar");
  const perfilNomeEl = document.getElementById("perfilNome");
  const perfilEmailEl = document.getElementById("perfilEmail");

  if (avatarEl) avatarEl.textContent = gerarIniciais(nome);
  if (perfilNomeEl) perfilNomeEl.textContent = nome;
  if (perfilEmailEl) perfilEmailEl.textContent = email;
}

(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    const file = (link.getAttribute("href") || "").split("/").pop();
    if (restritos.includes(file)) link.closest("li").style.display = "none";
  });
})();

// CONTROLE DE DADOS REAIS
let transacoes = [];
let tipoAtivo  = "todos";

function fmt(v) {
  return "R$ " + parseFloat(v).toFixed(2).replace(".", ",");
}

// Converte a data LocalDateTime do Java para o padrão dd/mm/yyyy · hh:mm
function formatarDataJavaParaExibir(dataIso) {
  if (!dataIso) return "";
  const d = new Date(dataIso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, "0");
  const minuto = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} · ${hora}:${minuto}`;
}

// FILTROS DE INTERFACE
function setTipo(tipo, btn) {
  tipoAtivo = tipo;
  document.querySelectorAll(".ftbtn").forEach(b => b.classList.remove("ativo"));
  btn.classList.add("ativo");
  aplicar();
}

function limparDatas() {
  document.getElementById("dataInicio").value = "";
  document.getElementById("dataFim").value = "";
  aplicar();
}

// FILTRAGEM (POR TIPO + INTERVALO DE DATA)
function filtrarLista() {
  let inicio = document.getElementById("dataInicio").value;
  let fim    = document.getElementById("dataFim").value;

  // Correção automática caso o usuário selecione uma data inicial maior que a final
  if (inicio && fim && inicio > fim) {
    document.getElementById("dataInicio").value = fim;
    document.getElementById("dataFim").value = inicio;
    inicio = fim;
    fim = document.getElementById("dataInicio").value;
  }

  return transacoes.filter(t => {
    // Filtro por tipo (entrada/saida)
    if (tipoAtivo !== "todos" && t.tipo.toLowerCase() !== tipoAtivo) return false;

    // Filtro por período
    if (inicio || fim) {
      const d = new Date(t.data);
      const dStr = d.getFullYear() + "-"
          + String(d.getMonth() + 1).padStart(2, "0") + "-"
          + String(d.getDate()).padStart(2, "0"); // Formato yyyy-mm-dd

      if (inicio && dStr < inicio) return false;
      if (fim    && dStr > fim)    return false;
    }
    return true;
  });
}

function aplicar() {
  renderizar(filtrarLista());
}

// RENDERIZAR NA TELA
function renderizar(lista) {
  const container = document.getElementById("listaTransacoes");
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p class="lista-vazia">Nenhuma transação encontrada.</p>';
    return;
  }

  container.innerHTML = "";
  lista.forEach(t => {
    const tipoFormatado = t.tipo.toLowerCase(); // Trata ENTRADA/SAIDA vindo do Java
    const item = document.createElement("div");
    item.className = "transacao-item " + tipoFormatado;

    item.innerHTML = `
      <div class="transacao-icone ${tipoFormatado}">
        <i class="fa-solid ${tipoFormatado === "entrada" ? "fa-arrow-up" : "fa-arrow-down"}"></i>
      </div>
      <div class="transacao-body">
        <div class="transacao-topo">
          <span class="transacao-valor ${tipoFormatado}">
            ${tipoFormatado === "entrada" ? "+" : "−"} ${fmt(t.valor)}
          </span>
          <span class="transacao-data">${formatarDataJavaParaExibir(t.data)}</span>
        </div>
        ${t.descricao ? `<div class="transacao-notas">${t.descricao}</div>` : ""}
      </div>
    `;
    container.appendChild(item);
  });
}

// CONSUMO DO GET DO CONTROLLER FINANCEIRO
async function carregarTransacoesDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) return;

  try {
    const response = await fetch("/financeiro", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      const todosLancamentos = await response.json();

      // FILTRO: Isola apenas os registros de CategoriaDeLancamento.SALAO
      transacoes = todosLancamentos.filter(l => l.categoria === "SALAO");

      console.log("Lançamentos de serviços carregados do MySQL:", transacoes.length);
      aplicar();
    } else {
      console.error("Erro ao carregar dados do endpoint financeiro.");
    }
  } catch (error) {
    console.error("Erro na requisição HTTP:", error);
  }
}

// INICIALIZAÇÃO
window.addEventListener("load", function () {
  carregarPerfil();
  carregarTransacoesDaAPI();
});

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "visible") {
    carregarTransacoesDaAPI();
  }
});