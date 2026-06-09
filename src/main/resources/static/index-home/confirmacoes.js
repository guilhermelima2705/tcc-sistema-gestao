// CONFIRMACOES.JS — LISTAGEM E DISPARO DE LEMBRETES DE VÉSPERA

function abrirMenu() {
    document.getElementById("sidebar").classList.add("aberta");
    document.getElementById("overlay").classList.add("ativo");
}

function fecharMenu() {
    document.getElementById("sidebar").classList.remove("aberta");
    document.getElementById("overlay").classList.remove("ativo");
}

function togglePerfil(event) {
    event.stopPropagation();
    document.getElementById("perfilDropdown").classList.toggle("aberto");
}

document.addEventListener("click", () => {
    document.getElementById("perfilDropdown").classList.remove("aberto");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharMenu();
});

function carregarPerfil() {
    const nome = sessionStorage.getItem("usuarioNome") || "Administrador";
    const email = sessionStorage.getItem("usuarioEmail") || "Painel de Controle";

    function gerarIniciais(n) {
        const partes = n.trim().split(/\s+/);
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    }

    document.getElementById("avatar").textContent = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent = nome;
    document.getElementById("perfilEmail").textContent = email;
}

let agendamentosAmanha = [];

async function carregarLembretesDaAPI() {
    const token = sessionStorage.getItem("meuTccToken");
    if (!token) return;

    try {
        const response = await fetch("/agendamento/amanha", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            agendamentosAmanha = await response.json();
            renderizarTabela(agendamentosAmanha);
        } else {
            console.error("Erro ao carregar agendamentos de véspera.");
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

function renderizarTabela(lista) {
    const corpo = document.getElementById("tabelaCorpo");
    const vazia = document.getElementById("tabelaVazia");
    if (!corpo) return;

    corpo.innerHTML = "";

    if (lista.length === 0) {
        vazia.style.display = "block";
        return;
    }
    vazia.style.display = "none";

    lista.forEach(a => {
        const tr = document.createElement("tr");

        // Extrai e formata a hora (Do formato LocalDateTime 2026-06-08T14:30:00 -> 14:30)
        const dataHoraObj = new Date(a.dataHora);
        const horaFormatada = String(dataHoraObj.getHours()).padStart(2, "0") + ":" + String(dataHoraObj.getMinutes()).padStart(2, "0");

        // Máscara para o telefone do cliente
        let telCliente = a.cliente.telefone || "";
        let telExibicao = telCliente;
        if (telCliente.replace(/\D/g, "").length === 11) {
            let limpo = telCliente.replace(/\D/g, "");
            telExibicao = `(${limpo.slice(0,2)}) ${limpo.slice(2,7)}-${limpo.slice(7)}`;
        }

        tr.innerHTML = `
      <td class="col-nowrap" style="font-weight: 600; color: var(--rose-gold-dark);">${horaFormatada}</td>
      <td>${a.cliente.nome}</td>
      <td class="col-nowrap">${telExibicao}</td>
      <td>${a.servico.nome}</td>
      <td>${a.funcionario.nome}</td>
      <td style="text-align: center; width: 120px;">
        <button class="btn-form-cadastrar" style="padding: 6px 12px; font-size: 0.8rem; width: auto;" 
                onclick="enviarLembrete('${a.cliente.nome}', '${telCliente}', '${horaFormatada}', '${a.servico.nome}', '${a.funcionario.nome}')">
          <i class="fa-brands fa-whatsapp"></i> Lembrar
        </button>
      </td>
    `;
        corpo.appendChild(tr);
    });
}

// 📲 DISPARO DO LEMBRETE PERSONALIZADO POR WHATSAPP

function enviarLembrete(nomeCliente, telefone, hora, servico, profissional) {
    let numeroLimpo = telefone.replace(/\D/g, "");
    if (!numeroLimpo.startsWith("55") && numeroLimpo.length > 0) {
        numeroLimpo = "55" + numeroLimpo;
    }

    // Texto para enviar
    const msg =
        `Olá, *${nomeCliente.split(" ")[0]}*! Tudo bem?\n\n` +
        `Passando para lembrar do seu momento de autocuidado agendado para *amanhã* aqui no *Espaço Carmem Lúcia*:\n\n` +
        `✂️ *Serviço:* ${servico}\n` +
        `⏰ *Horário:* ${hora}\n` +
        `💼 *Profissional:* ${profissional}\n\n` +
        `Podemos confirmar a sua presença? Caso precise reagendar, por favor nos avise. Estamos ansiosas para receber você! ✨`;

    window.open(`https://wa.me/${numeroLimpo}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Inicializa a tela
carregarPerfil();
carregarLembretesDaAPI();