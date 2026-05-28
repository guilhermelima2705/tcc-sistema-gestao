// NOVO_AGENDAMENTO.JS - INTEGRADO COM SPRING BOOT

// MENU LATERAL — Abre o painel deslizante ao clicar no hambúrguer
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

// MENU LATERAL — Fecha o painel deslizante
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

// Fecha o menu ao pressionar ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { fecharMenu(); fecharModal(); }
});

// AVATAR — Exibe ou oculta o dropdown de perfil
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

// Fecha dropdown ao clicar fora dele
document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

// Gera as iniciais do nome para o avatar
function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// PERFIL - PROTEGIDO COM VALIDAÇÃO JWT REAL
function carregarPerfil() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) {
    window.location.href = "../login/login.html"; // Joga pro login de verdade se não tiver token
    return;
  }

  // Preenche valores padrão provisórios para não quebrar o layout
  const nome  = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";

  document.getElementById("avatar").textContent      = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email;
}

// PERMISSÕES — Esconde itens do menu restrito
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

// MODAL DE SUCESSO — Exibe e fecha o modal
function abrirModal() {
  document.getElementById("modalSucesso").classList.add("aberto");
}

function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
}

// SUBMIT DO FORMULÁRIO CONECTADO AO SPRING BOOT
document.getElementById("formAgendamento").addEventListener("submit", async function (e) {
  e.preventDefault();

  const msgDiv = document.getElementById("msgAgendamento");
  msgDiv.className = "msg";
  msgDiv.textContent = "Processando agendamento...";
  msgDiv.style.color = "blue";

  const token = sessionStorage.getItem("meuTccToken");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "../login/login.html";
    return;
  }

  const dataISO = document.getElementById("data_agendamento").value;
  const hora = document.getElementById("hora_agendamento").value;
  const dataHoraFormatada = `${dataISO}T${hora}:00`;

  const dadosParaOBackend = {
    clienteId: parseInt(document.getElementById("cliente_id").value),
    funcionarioId: parseInt(document.getElementById("colaborador_id").value),
    servicoId: parseInt(document.getElementById("servico_id").value),
    dataHora: dataHoraFormatada
  };

  try {
    const response = await fetch("/agendamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosParaOBackend)
    });

    if (response.ok) {
      msgDiv.textContent = "";
      abrirModal();
      document.getElementById("formAgendamento").reset();
    } else {
      const errorData = await response.text();
      msgDiv.textContent = `Erro ao agendar: ${errorData}`;
      msgDiv.classList.add("show", "erro");
      msgDiv.style.color = "red";
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    msgDiv.textContent = "Erro ao conectar com o servidor.";
    msgDiv.classList.add("show", "erro");
    msgDiv.style.color = "red";
  }
});

// Variável global para guardar todos os clientes da pesquisa
let todosClientes = [];

// 1. Desenha a lista flutuante de sugestões (na tag UL do HTML)
function renderizarSugestoesClientes(lista) {
  const listaSugestoes = document.getElementById("lista_sugestoes");
  listaSugestoes.innerHTML = "";

  if (lista.length === 0) {
    listaSugestoes.innerHTML = `<li style="padding: 10px; color: #999; font-size: 0.9rem;">Nenhum cliente encontrado</li>`;
    return;
  }

  lista.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c.nome;
    li.style.cssText = "padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 0.9rem; transition: background 0.2s; color: #333;";

    // Efeito visual elegante ao passar o mouse pelas opções da lista
    li.onmouseenter = () => li.style.backgroundColor = "#f5f5f5";
    li.onmouseleave = () => li.style.backgroundColor = "transparent";

    // Quando a Carmem clicar no nome do cliente desejado na lista flutuante
    li.onclick = function () {
      document.getElementById("pesquisa_cliente").value = c.nome; // Escreve o nome no campo visível
      document.getElementById("cliente_id").value = c.id;       // Guarda o ID secreto para enviar pro Java
      listaSugestoes.style.display = "none";                     // Fecha a caixinha de sugestões
    };

    listaSugestoes.appendChild(li);
  });
}

// 2. Filtro em tempo real ativado automaticamente a cada letra digitada
function filtrarClientes() {
  const termoDigitado = document.getElementById("pesquisa_cliente").value.trim().toLowerCase();
  const listaSugestoes = document.getElementById("lista_sugestoes");

  // Se o campo de pesquisa for limpo, esconde a lista e zera o ID
  if (termoDigitado === "") {
    listaSugestoes.style.display = "none";
    document.getElementById("cliente_id").value = "";
    return;
  }

  // Filtra na memória do navegador a partir do que veio do banco
  const clientesFiltrados = todosClientes.filter(c =>
      c.nome.toLowerCase().includes(termoDigitado)
  );

  // Exibe o painel flutuante e renderiza a lista atualizada
  listaSugestoes.style.display = "block";
  renderizarSugestoesClientes(clientesFiltrados);
}

// 3. Fecha a lista de sugestões automaticamente se o usuário clicar fora do campo
document.addEventListener("click", function (e) {
  const listaSugestoes = document.getElementById("lista_sugestoes");
  if (listaSugestoes && e.target.id !== "pesquisa_cliente") {
    listaSugestoes.style.display = "none";
  }
});

// 4. BUSCA AS LISTAS REAIS DO BANCO DE DADOS (CORRIGIDA)
async function carregarListasDoBanco() {
  const token = sessionStorage.getItem("meuTccToken");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  try {
    // Busca os Clientes e guarda na variável global (Sem renderizar nada de início)
    const resClientes = await fetch("/cliente", { headers });
    if (resClientes.ok) {
      todosClientes = await resClientes.json();
    }

    // Busca os Serviços e preenche o select
    const resServicos = await fetch("/servico", { headers });
    if (resServicos.ok) {
      const servicos = await resServicos.json();
      const selectServico = document.getElementById("servico_id");
      selectServico.innerHTML = '<option value="">Selecione o Serviço</option>';
      servicos.forEach(s => {
        selectServico.innerHTML += `<option value="${s.id}">${s.nome} (R$ ${Number(s.valor).toFixed(2).replace('.', ',')})</option>`;
      });
    }

    // Busca os Funcionários e preenche o select
    const resFunc = await fetch("/funcionario", { headers });
    if (resFunc.ok) {
      const funcionarios = await resFunc.json();
      const selectFunc = document.getElementById("colaborador_id");
      selectFunc.innerHTML = '<option value="">Selecione o Profissional</option>';
      funcionarios.forEach(f => {
        selectFunc.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
      });
    }

  } catch (error) {
    console.error("Erro ao carregar listas do banco:", error);
  }
}

// INICIALIZAÇÃO — Executa automaticamente assim que a página carrega
carregarPerfil();
carregarListasDoBanco();