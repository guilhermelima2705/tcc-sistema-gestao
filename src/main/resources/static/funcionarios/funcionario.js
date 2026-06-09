// FUNCIONARIO.JS

// MENU LATERAL — Abre o painel lateral ao clicar no ícone hambúrguer
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

// MENU LATERAL — Fecha o painel lateral
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

// Fecha menu e modais ao pressionar a tecla ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharMenu();
    fecharModal("modalAtualizar");
    fecharModal("modalConfirmarExclusaoFunc");
  }
});

// AVATAR — Exibe ou oculta o dropdown de perfil ao clicar no avatar
function togglePerfil(event) {
  event.stopPropagation(); // Impede que o clique feche o dropdown imediatamente
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

// Fecha o dropdown de perfil ao clicar em qualquer lugar da tela
document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

// Gera as iniciais do nome para exibir no avatar 
function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// Carrega os dados do usuário logado a partir do sessionStorage
// Se não houver usuário logado, redireciona para o login
function carregarPerfil() {
  const nome = sessionStorage.getItem("usuarioNome") || "Funcionário(a)";
  const email = sessionStorage.getItem("usuarioEmail") || "Acesso Verificado";

  document.getElementById("avatar").textContent = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent = nome;
  document.getElementById("perfilEmail").textContent = email;
}

// PERMISSÕES — Esconde itens do menu lateral que a funcionária não pode acessar
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return; // Proprietária vê tudo
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    if (restritos.includes(file))
      link.closest("li").style.display = "none"; // Oculta o item do menu
  });
})();

let funcionarios = []; // Começa vazia, o Java vai preencher!

// 1. FAZ O GET NA API DO SPRING BOOT
async function carregarFuncionariosDaAPI() {
  const token = sessionStorage.getItem("meuTccToken");
  if (!token) return;

  try {
    const response = await fetch("/funcionario", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      funcionarios = await response.json();
      renderizarTabela(funcionarios); // Desenha a tabela com os dados reais
    } else {
      console.error("Erro ao buscar funcionários no banco de dados.");
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

// 2. RENDERIZA A TABELA COM AS COLUNAS CORRETAS
function renderizarTabela(lista) {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;

  corpo.innerHTML = "";

  // Ordena alfabeticamente
  const ordenados = [...lista].sort((a, b) => a.nome.localeCompare(b.nome));

  if (ordenados.length === 0) {
    vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  vazia.style.display = "none";

  ordenados.forEach(f => {
    const tr = document.createElement("tr");

    // Traduz o Enum do Java para algo legível na tela
      const nomeCargo = f.papel === "ADMIN" ? "Administrador" : "Funcionário";

    // ✨ Formatação visual para exibir o número na tabela (colocando máscara se tiver 11 dígitos)
    let telExibicao = "—";
    if (f.telefone) {
      let limpo = f.telefone.replace(/\D/g, "");
      if (limpo.length === 11) {
        telExibicao = `(${limpo.slice(0,2)}) ${limpo.slice(2,7)}-${limpo.slice(7)}`;
      } else {
        telExibicao = f.telefone;
      }
    }

    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${f.id}" onchange="atualizarBotoes()" />
      </td>
      <td class="col-nome">
        <span class="status-bolinha ${f.ativo ? 'ativo' : 'inativo'}"></span>
        ${f.nome}
      </td>
      <td class="col-nowrap">${f.email || "—"}</td>
      <td class="col-nowrap">${telExibicao}</td> <!-- ✨ Coluna de telefone adicionada -->
      <td class="col-nowrap">${nomeCargo}</td>
    `;
    corpo.appendChild(tr);
  });

  atualizarBotoes();
}

// 3. ATUALIZA A PESQUISA PARA USAR EMAIL, TELEFONE E CARGO
function filtrarFuncionarios() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  const filtrados = funcionarios.filter(f =>
      f.nome.toLowerCase().includes(termo) ||
      (f.email && f.email.toLowerCase().includes(termo)) ||
      (f.telefone && f.telefone.toLowerCase().includes(termo)) || // ✨ Permite pesquisar pelo telefone
      (f.papel && f.papel.toLowerCase().includes(termo))
  );
  renderizarTabela(filtrados);
}

// CHECKBOX MESTRE
function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}

// ATUALIZA BOTÕES
function atualizarBotoes() {
  const total    = document.querySelectorAll(".check-linha").length;
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  const checkTodos = document.getElementById("checkTodos");
  if(checkTodos) checkTodos.checked = total > 0 && marcados === total;

  const btnAtualizar = document.getElementById("btnAtualizar");
  const btnExcluir   = document.getElementById("btnExcluir");
  const btnFolga     = document.getElementById("btnFolga");

  if(btnExcluir) btnExcluir.disabled   = marcados === 0;
  if(btnAtualizar) btnAtualizar.disabled = marcados !== 1;
  if(btnFolga) btnFolga.disabled         = marcados !== 1;
}

// Pega os dados do funcionário que teve o checkbox marcado
function getFuncionarioSelecionado() {
  const cb = document.querySelector(".check-linha:checked");
  if (!cb) return null;
  return funcionarios.find(f => f.id === parseInt(cb.dataset.id));
}

// Abre a tela de atualizar com os dados já preenchidos
function abrirModalAtualizar() {
  const f = getFuncionarioSelecionado();
  if (!f) return;

  document.getElementById("editNome").value = f.nome;
  document.getElementById("editEmail").value = f.email || "";
  document.getElementById("editTelefone").value = f.telefone || ""; // ✨ Preenche o telefone guardado no banco
  document.getElementById("editPapel").value = f.papel || "USER";
  document.getElementById("editSenha").value = ""; // Deixa a senha em branco por padrão

  document.getElementById("modalAtualizar").classList.add("aberto");
}

// Abre o modal de folga preenchendo o nome do funcionário selecionado
function abrirModalFolga() {
  const f = getFuncionarioSelecionado();
  if (!f) return;

  document.getElementById("nomeFuncFolga").textContent = f.nome;
  document.getElementById("dataFolga").value = "";
  document.getElementById("motivoFolga").value = "";

  // Configura a data mínima do input para hoje, ninguém lança folga no passado
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataFolga").min = hoje;

  document.getElementById("modalFolga").classList.add("aberto");
}

// Envia os dados via POST para a API do Java
async function salvarFolgaDoFuncionario() {
  const f = getFuncionarioSelecionado();
  if (!f) return;

  const token = sessionStorage.getItem("meuTccToken");
  const dataBloqueio = document.getElementById("dataFolga").value;
  const motivo = document.getElementById("motivoFolga").value.trim();

  if (!dataBloqueio || !motivo) {
    alert("Todos os campos são obrigatórios.");
    return;
  }

  const payload = {
    funcionarioId: f.id,
    dataBloqueio: dataBloqueio,
    motivo: motivo
  };

  try {
    const response = await fetch("/folga", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Folga/Recesso lançado com sucesso! Agenda bloqueada para este dia.");
      fecharModal("modalFolga");
    } else {
      const erro = await response.text();
      alert(`Erro ao lançar folga: ${erro}`);
    }
  } catch (error) {
    console.error("Erro no POST da folga:", error);
    alert("Erro de conexão com o servidor.");
  }
}

// Envia a atualização (PUT) para o Spring Boot
async function salvarAtualizacao() {
  const f = getFuncionarioSelecionado();
  if (!f) return;

  const token = sessionStorage.getItem("meuTccToken");
  const nomeNovo = document.getElementById("editNome").value.trim();
  const emailNovo = document.getElementById("editEmail").value.trim();
  const telefoneNovo = document.getElementById("editTelefone").value.replace(/\D/g, "").trim(); // ✨ Pega apenas os números do telefone
  const papelNovo = document.getElementById("editPapel").value;
  const senhaNova = document.getElementById("editSenha").value.trim() || "senha_mantida_123";

  if (!nomeNovo || !emailNovo) {
    alert("Nome e E-mail são obrigatórios.");
    return;
  }

  // ✨ Adicionado o campo "telefone" no DTO enviado para o Java
  const dadosDTO = {
    nome: nomeNovo,
    email: emailNovo,
    telefone: telefoneNovo,
    senha: senhaNova,
    papel: papelNovo
  };

  try {
    const response = await fetch(`/funcionario/${f.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosDTO)
    });

    if (response.ok || response.status === 204) {
      fecharModal("modalAtualizar");
      carregarFuncionariosDaAPI(); // Reatualiza a lista dinâmica na hora
    } else {
      const erro = await response.text();
      alert(`Erro ao atualizar: ${erro}`);
    }
  } catch (error) {
    console.error("Erro no PUT:", error);
    alert("Erro de conexão com o servidor.");
  }
}

// Abre o modal de confirmar exclusão
function confirmarExclusao() {
  const ids = Array.from(document.querySelectorAll(".check-linha:checked")).map(cb => parseInt(cb.dataset.id));
  if (ids.length === 0) return;
  window._idsParaExcluirFunc = ids;
  document.getElementById("modalConfirmarExclusaoFunc").classList.add("aberto");
}

// Envia a exclusão (DELETE) para o Spring Boot
async function ejecutarExclusaoFunc() {
  const ids = window._idsParaExcluirFunc || [];
  if (ids.length === 0) return;
  const token = sessionStorage.getItem("meuTccToken");

  try {
    const promessas = ids.map(id =>
        fetch(`/funcionario/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
    );
    await Promise.all(promessas);

    const checkTodos = document.getElementById("checkTodos");
    if (checkTodos) checkTodos.checked = false;

    fecharModal("modalConfirmarExclusaoFunc");
    carregarFuncionariosDaAPI(); // Atualiza a tabela na hora
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir funcionário(s).");
  }
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("aberto");
}

// Fecha clicando fora
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    fecharModal(e.target.id);
  }
});

// Intercepta o botão "Salvar" do modal de atualização para não recarregar a tela
const formAtualizar = document.getElementById("formAtualizar");
if (formAtualizar) {
  formAtualizar.addEventListener("submit", function(e) {
    e.preventDefault();
    salvarAtualizacao();
  });
}

const formFolga = document.getElementById("formFolga");
if (formFolga) {
  formFolga.addEventListener("submit", function(e) {
    e.preventDefault();
    salvarFolgaDoFuncionario();
  });
}

// ✨ Máscara automática (61) 99999-9999 aplicada dinamicamente no campo do Modal
const inputTelEdit = document.getElementById("editTelefone");
if (inputTelEdit) {
  inputTelEdit.addEventListener("input", function(e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 2) e.target.value = v;
    else if (v.length <= 7) e.target.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else e.target.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  });
}

// Inicialização
carregarPerfil();
carregarFuncionariosDaAPI(); // Chama o Java assim que a tela abre!