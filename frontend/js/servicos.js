let filtroAtivo = "todos";

async function carregarServicos(status = "todos") {
    const lista = document.getElementById("lista-servicos");
    lista.innerHTML = `<div class="loading">Carregando...</div>`;

    try {
        const url = status === "todos"
            ? `${API_URL}/servicos/`
            : `${API_URL}/servicos/status/${status}`;

        const res = await fetch(url);
        const servicos = await res.json();

        if (servicos.length === 0) {
            lista.innerHTML = `
                <div class="estado-vazio">
                    <div class="icone">📋</div>
                    <p>Nenhum serviço encontrado.</p>
                </div>
            `;
            return;
        }

        lista.innerHTML = servicos.map(s => {
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
                        ${s.observacoes ? `<span>📝 ${s.observacoes}</span>` : ""}
                    </div>
                </a>
            `;
        }).join("");

    } catch (erro) {
        lista.innerHTML = `<p style="color:var(--vermelho)">Erro ao carregar serviços.</p>`;
    }
}

function filtrar(status, botao) {
    filtroAtivo = status;

    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
    botao.classList.add("ativo");

    carregarServicos(status);
}

carregarServicos();