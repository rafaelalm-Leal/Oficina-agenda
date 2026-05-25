document.getElementById("data-hoje").textContent = 
    new Date().toLocaleDateString("pt-BR", { 
        weekday: "short", 
        day: "2-digit", 
        month: "short" 
    });

async function carregarDashboard() {
    try {
        const resumo = await fetch(`${API_URL}/servicos/dashboard/resumo`);
        const dados = await resumo.json();

        document.getElementById("num-agendados").textContent = dados.agendados;
        document.getElementById("num-andamento").textContent = dados.em_andamento;
        document.getElementById("num-concluidos").textContent = dados.concluidos;
        document.getElementById("num-slots").textContent = 
            dados.slots_total - dados.slots_usados;

        renderizarSlots(dados);

        await carregarServicosAtivos();

    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
    }
}

function renderizarSlots(dados) {
    const barra = document.getElementById("slots-barra");
    const texto = document.getElementById("slots-texto");
    const alerta = document.getElementById("alerta-lotado");

    barra.innerHTML = "";
    texto.textContent = `${dados.slots_usados}/${dados.slots_total} na oficina agora`;

    for (let i = 0; i < dados.slots_total; i++) {
        const slot = document.createElement("div");
        slot.className = "slot";

        if (i < dados.slots_usados) {
            slot.classList.add(dados.lotado ? "lotado" : "ocupado");
        }

        barra.appendChild(slot);
    }

    if (dados.lotado) {
        alerta.style.display = "block";
        alerta.textContent = "⚠️ Oficina lotada! Conclua um serviço para liberar uma vaga.";
    } else {
        alerta.style.display = "none";
    }

    const numSlots = document.getElementById("num-slots");
    if (numSlots) {
        numSlots.textContent = dados.slots_total - dados.slots_usados;
    }
}

async function carregarServicosAtivos() {
    const lista = document.getElementById("lista-ativos");

    try {
        const [resAgendados, resAndamento] = await Promise.all([
            fetch(`${API_URL}/servicos/status/agendado`),
            fetch(`${API_URL}/servicos/status/em_andamento`)
        ]);

        const agendados = await resAgendados.json();
        const andamento = await resAndamento.json();
        const todos = [...andamento, ...agendados];

        if (todos.length === 0) {
            lista.innerHTML = `
                <div class="estado-vazio">
                    <div class="icone">🔧</div>
                    <p>Nenhum serviço ativo no momento.</p>
                </div>
            `;
            return;
        }

        lista.innerHTML = todos.map(s => criarCardServico(s)).join("");

    } catch (erro) {
        lista.innerHTML = `<p style="color:var(--vermelho)">Erro ao carregar serviços.</p>`;
    }
}

function criarCardServico(s) {
    const tipos = s.itens.map(i => i.tipo.nome).join(", ");
    return `
        <a href="detalhe.html?id=${s.id}" class="card-servico ${s.status}">
            <div class="card-servico-header">
                <span class="card-nome">${s.cliente.nome}</span>
                <span class="badge ${s.status}">${STATUS_LABEL[s.status]}</span>
            </div>
            <div class="card-servico-info">
                <span>🔧 ${tipos}</span>
                <span>📅 Entrada: ${formatarData(s.data_entrada)}</span>
                <span>🏁 Entrega: ${formatarData(s.previsao_entrega)}</span>
            </div>
        </a>
    `;
}

carregarDashboard();