/* RELATORIO-SERVICOS.JS — INTEGRADO COM SPRING BOOT */

// MENU LATERAL
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

// AVATAR / PERFIL
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

// PERMISSÕES
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

// DADOS DO BANCO DE DADOS
let transacoes = [];
let filtroAtivo = "todos";

function fmt(v) {
  return "R$ " + parseFloat(v).toFixed(2).replace(".", ",");
}

// Formata data ISO (Java LocalDateTime) para exibição padrão BR
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

// TOAST DE FEEDBACK
function mostrarToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// POPULAR ANOS NO SELECT
function popularAnos() {
  const selectAno = document.getElementById("selectAno");
  if (!selectAno) return;
  const anoAtual = new Date().getFullYear();
  const anos = [];
  for (let i = -2; i <= 2; i++) anos.push(anoAtual + i);
  const anosUnicos = [...new Set(anos)].sort();
  selectAno.innerHTML = '<option value="">Ano</option>';
  anosUnicos.forEach(ano => {
    const option = document.createElement("option");
    option.value = ano;
    option.textContent = ano;
    selectAno.appendChild(option);
  });
}

function mudouMes() {
  const mes = document.getElementById("selectMes").value;
  const selectAno = document.getElementById("selectAno");
  if (mes) {
    selectAno.style.display = "block";
    selectAno.value = "";
  } else {
    selectAno.style.display = "none";
    selectAno.value = "";
  }
  aplicarFiltros();
}

// FILTRO DE INTERFACE (TODOS / ENTRADAS / SAÍDAS)
function setFiltro(tipo, btn) {
  filtroAtivo = tipo;
  document.querySelectorAll(".rel-filtro-btn").forEach(b => b.classList.remove("ativo"));
  btn.classList.add("ativo");
  aplicarFiltros();
}

// REQUISIÇÃO GET CONECTADA AO SPRING BOOT
async function carregarRelatorioDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) return;

  try {
    const response = await fetch("/financeiro", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      const todosLancamentos = await response.json();

      // FILTRO DE CATEGORIA: Traz apenas os registros de SALAO do seu Enum Java
      transacoes = todosLancamentos.filter(l => l.categoria === "SALAO");

      aplicarFiltros();
    } else {
      console.error("Erro ao carregar dados do endpoint financeiro.");
    }
  } catch (error) {
    console.error("Erro na requisição HTTP:", error);
  }
}

// PROCESSA FILTROS E ATUALIZA TOTAIS DOS CARDS DINAMICAMENTE
function aplicarFiltros() {
  const mes = document.getElementById("selectMes").value;
  const ano = document.getElementById("selectAno").value;

  const resultadoFiltrado = transacoes.filter(t => {
    const tipoFormatado = t.tipo.toLowerCase();
    const matchTipo = filtroAtivo === "todos" || tipoFormatado === filtroAtivo;

    let matchData = true;
    if (mes || ano) {
      const d = new Date(t.data);
      const mT = String(d.getMonth() + 1).padStart(2, "0");
      const aT = String(d.getFullYear());
      if (mes && mT !== mes) matchData = false;
      if (ano && aT !== ano) matchData = false;
    }
    return matchTipo && matchData;
  });

  // Calcula faturamento baseado no filtro da tela
  let somaE = 0, somaS = 0;
  resultadoFiltrado.forEach(t => {
    if (t.tipo.toLowerCase() === "entrada") somaE += parseFloat(t.valor);
    else somaS += parseFloat(t.valor);
  });
  const saldo = somaE - somaS;

  document.getElementById("totalEntradas").textContent = fmt(somaE);
  document.getElementById("totalSaidas").textContent = fmt(somaS);

  const elSaldo = document.getElementById("saldoLiquido");
  if (elSaldo) {
    elSaldo.textContent = fmt(Math.abs(saldo));
    elSaldo.className = "rel-saldo-valor " + (saldo >= 0 ? "positivo" : "negativo");
  }

  renderizarLista(resultadoFiltrado);
}

// INJETA OS ELEMENTOS NA TELA
function renderizarLista(lista) {
  const container = document.getElementById("listaTransacoes");
  const vazia = document.getElementById("listaVazia");
  if (!container) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    vazia.style.display = "block";
    atualizarBotaoExcluir();
    return;
  }
  vazia.style.display = "none";

  lista.forEach(t => {
    const tipoFormatado = t.tipo.toLowerCase();
    const div = document.createElement("div");
    div.className = "transacao-item " + tipoFormatado;

    div.innerHTML = `
      <input
        type="checkbox"
        class="transacao-check"
        data-id="${t.id}"
        onchange="atualizarBotaoExcluir()"
      />
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
    container.appendChild(div);
  });

  atualizarBotaoExcluir();
}

function atualizarBotaoExcluir() {
  const marcados = document.querySelectorAll(".transacao-check:checked").length;
  document.getElementById("btnExcluir").disabled = marcados === 0;
}

function excluirSelecionados() {
  const ids = Array.from(document.querySelectorAll(".transacao-check:checked"))
      .map(cb => parseInt(cb.dataset.id));

  if (ids.length === 0) return;

  window._idsParaExcluir = ids;
  document.getElementById("modalConfirmarExcluir").classList.add("aberto");
}

// REQUISIÇÃO DELETE REAL CONECTADA AO JAVA
async function ejecutarExclusaoConfirmada() {
  const ids = window._idsParaExcluir || [];
  if (ids.length === 0) return;
  const token = sessionStorage.getItem("meuTccToken");

  try {
    const promessas = ids.map(id =>
        fetch(`/financeiro/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
    );
    await Promise.all(promessas);

    fecharModal("modalConfirmarExcluir");
    window._idsParaExcluir = [];
    mostrarToast("🗑️ Registro(s) de serviço(s) excluído(s)!");
    carregarRelatorioDaAPI();
  } catch (error) {
    console.error("Erro ao deletar:", error);
    alert("Erro ao efetuar exclusão.");
  }
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("aberto");
}

// EXPORTAR EXTRATO PDF - DINÂMICO E CORRIGIDO
function exportarPDF() {
  const mes = document.getElementById("selectMes").value;
  const ano = document.getElementById("selectAno").value;
  const nomesMes = ["","Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  let periodo = "Todos os períodos";
  if (mes && ano) periodo = nomesMes[parseInt(mes)] + " de " + ano;
  else if (mes)   periodo = nomesMes[parseInt(mes)];
  else if (ano)   periodo = "Ano " + ano;

  const lista = transacoes.filter(t => {
    const matchTipo = filtroAtivo === "todos" || t.tipo.toLowerCase() === filtroAtivo;
    let matchData = true;
    if (mes || ano) {
      const d = new Date(t.data);
      const mT = String(d.getMonth() + 1).padStart(2, "0");
      const aT = String(d.getFullYear());
      if (mes && mT !== mes) matchData = false;
      if (ano && aT !== ano) matchData = false;
    }
    return matchTipo && matchData;
  });

  let entradas = 0, saidas = 0;
  lista.forEach(t => {
    if (t.tipo.toLowerCase() === "entrada") entradas += parseFloat(t.valor);
    else saidas += parseFloat(t.valor);
  });
  const saldo = entradas - saidas;

  const linhas = lista.map(t => {
    const somenteData = formatarDataJavaParaExibir(t.data).split(" · ")[0];
    const tipoFormatado = t.tipo.toLowerCase();
    return `
    <tr>
      <td style="padding:9px 8px; white-space:nowrap;">${somenteData}</td>
      <td style="padding:9px 8px;" class="${tipoFormatado === "entrada" ? "tipo-e" : "tipo-s"}">${tipoFormatado === "entrada" ? "Entrada" : "Saída"}</td>
      <td style="padding:9px 8px;">${t.descricao || "—"}</td>
      <td style="padding:9px 8px;" class="val-td ${tipoFormatado === "entrada" ? "tipo-e" : "tipo-s"}">${tipoFormatado === "entrada" ? "+" : "−"} R$ ${parseFloat(t.valor).toFixed(2).replace(".", ",")}</td>
    </tr>`;
  }).join("");

  const saldoAbs = Math.abs(saldo).toFixed(2).replace(".", ",");
  const saldoComSinal = saldo >= 0 ? `R$ ${saldoAbs}` : `− R$ ${saldoAbs}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>Relatório de Serviços · ${periodo}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#3a2e2b;background:#fff;padding:24px 20px}
  .cab{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1.5px solid #e8d5cc}
  .cab h1{font-size:20px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:#b07060}
  .cab h2{font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;margin-top:5px;color:#7a6060}
  .cab p{font-size:11px;color:#a89090;margin-top:6px}
  .resumo-wrap{margin-bottom:24px}
  .resumo-row{display:flex;gap:10px;margin-bottom:8px}
  .resumo-row .bloco{flex:1;border:1px solid #e8d5cc;border-radius:8px;padding:10px 12px;text-align:center}
  .resumo-saldo{text-align:center;border:1px solid #d4b8b0;border-radius:8px;padding:10px 14px;background:#fdf9f7}
  .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#a08080;display:block;margin-bottom:4px}
  .val-e{font-size:17px;font-weight:700;color:#165c30}
  .val-s{font-size:17px;font-weight:700;color:#7a1c1c}
  .val-b-pos{font-size:18px;font-weight:700;color:#165c30}
  .val-b-neg{font-size:18px;font-weight:700;color:#7a1c1c}
  .tabela-responsive{width:100%;margin-top:4px}
  .tabela-mobile{display:none}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead tr{background:#f8f0ec}
  th{padding:10px 10px;text-align:left;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a6a;font-weight:600}
  th:last-child{text-align:right}
  td{padding:10px 10px;border-bottom:1px solid #f2e8e4;vertical-align:middle}
  .tipo-e{color:#165c30;font-weight:600}
  .tipo-s{color:#7a1c1c;font-weight:600}
  .val-td{font-size:13px;font-weight:700;text-align:right;white-space:nowrap}
  .rodape{margin-top:36px;text-align:center;font-size:10px;color:#c0a8a8;border-top:1px solid #f0e0dc;padding-top:14px}
  @media (min-width: 600px) { body{padding:36px 40px} .cab h1{font-size:22px} }
  @media (max-width: 599px) {
    body{padding:16px 14px} .cab h1{font-size:16px;letter-spacing:2px} .cab h2{font-size:10px} .cab p{font-size:10px} .cab{margin-bottom:16px;padding-bottom:12px}
    .resumo-wrap{margin-bottom:16px} .resumo-row .bloco{padding:8px 10px} .lbl{font-size:8px} .val-e,.val-s{font-size:15px} .val-b-pos,.val-b-neg{font-size:16px} .resumo-saldo{padding:8px 12px}
    .tabela-responsive{display:none} .tabela-mobile{display:flex;flex-direction:column;gap:7px;margin-top:4px}
    .t-card{border-left:3px solid #ccc;border-radius:6px;padding:11px 12px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
    .t-card.entrada{border-color:#2e8b65} .t-card.saida{border-color:#c0392b}
    .t-card-topo{display:flex;align-items:center;gap:8px;flex-wrap:nowrap}
    .t-card-valor{font-size:14px;font-weight:700;white-space:nowrap} .t-card-valor.entrada{color:#165c30} .t-card-valor.saida{color:#7a1c1c}
    .t-card-badge{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;padding:2px 5px;border-radius:3px;white-space:nowrap;flex-shrink:0}
    .t-card-badge.entrada{border:1px solid #2e8b65;color:#2e8b65} .t-card-badge.saida{border:1px solid #c0392b;color:#7a1c1c}
    .t-card-data{font-size:10px;color:#a08080;white-space:nowrap;margin-left:auto;flex-shrink:0}
    .t-card-notas{font-size:11px;color:#8a7070;font-style:italic;margin-top:5px;line-height:1.4;padding-top:5px;border-top:1px solid #f2ebe8}
  }
</style></head><body>
<div class="cab">
  <h1>Espaço Carmem Lúcia</h1>
  <h2>Relatório de Serviços</h2>
  <p>Período: ${periodo} &nbsp;·&nbsp; Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p>
</div>
<div class="resumo-wrap">
  <div class="resumo-row">
    <div class="bloco">
      <span class="lbl">Entradas</span>
      <span class="val-e">+ ${entradas.toFixed(2).replace(".", ",")}</span>
    </div>
    <div class="bloco">
      <span class="lbl">Saídas</span>
      <span class="val-s">− ${saidas.toFixed(2).replace(".", ",")}</span>
    </div>
  </div>
  <div class="resumo-saldo">
    <span class="lbl">Saldo do período</span>
    <span class="${saldo >= 0 ? "val-b-pos" : "val-b-neg"}">${saldoComSinal}</span>
  </div>
</div>
<div class="tabela-responsive">
  <table>
    <thead>
      <tr><th style="width:22%">Data</th><th style="width:16%">Tipo</th><th>Observações</th><th style="width:22%;text-align:right">Valor</th></tr>
    </thead>
    <tbody>${linhas || '<tr><td colspan="4" style="text-align:center;padding:24px;color:#a08080;font-style:italic;">Nenhuma transação no período.</td></tr>'}</tbody>
  </table>
</div>
<div class="tabela-mobile">
  ${lista.length === 0
      ? '<p style="text-align:center;color:#a08080;font-style:italic;padding:20px 0">Nenhuma transação no período.</p>'
      : lista.map(t => `
        <div class="t-card ${t.tipo.toLowerCase()}">
          <div class="t-card-topo">
            <span class="t-card-valor ${t.tipo.toLowerCase()}">${t.tipo.toLowerCase() === "entrada" ? "+" : "−"} R$ ${parseFloat(t.valor).toFixed(2).replace(".", ",")}</span>
            <span class="t-card-badge ${t.tipo.toLowerCase()}">${t.tipo.toLowerCase() === "entrada" ? "Entrada" : "Saída"}</span>
            <span class="t-card-data">${formatarDataJavaParaExibir(t.data)}</span>
          </div>
          ${t.descricao ? `<div class="t-card-notas">${t.descricao}</div>` : ""}
        </div>`).join("")
  }
</div>
<div class="rodape">Espaço Carmem Lúcia · Sistema de Gestão</div>
</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// INICIALIZAÇÃO
window.addEventListener("load", function () {
  carregarPerfil();
  popularAnos();
  carregarRelatorioDaAPI();
});