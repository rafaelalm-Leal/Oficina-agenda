const params = new URLSearchParams(window.location.search);
const servicoId = params.get("id");
let servicoAtual = null;

async function carregarDetalhe() {
    const conteudo = document.getElementById("conteudo-detalhe");

    if (!servicoId) {
        window.location.href = "servicos.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/servicos/${servicoId}`);
        servicoAtual = await res.json();
        renderizarDetalhe(servicoAtual);
    } catch (erro) {
        conteudo.innerHTML = `<p style="color:var(--vermelho)">Erro ao carregar serviço.</p>`;
    }
}

function renderizarDetalhe(s) {
    const conteudo = document.getElementById("conteudo-detalhe");
    const tipos = s.itens.map(i => i.tipo.nome).join(", ");
    const botoesStatus = gerarBotoesStatus(s.status);

    conteudo.innerHTML = `
        <div class="detalhe-info">
            <div class="detalhe-linha">
                <span class="campo">Cliente</span>
                <span class="valor">${s.cliente.nome}</span>
            </div>
            <div class="detalhe-linha">
                <span class="campo">Telefone</span>
                <span class="valor">${s.cliente.telefone}</span>
            </div>
            <div class="detalhe-linha">
                <span class="campo">Serviços</span>
                <span class="valor">${tipos}</span>
            </div>
            <div class="detalhe-linha">
                <span class="campo">Status</span>
                <span class="valor">
                    <span class="badge ${s.status}">${STATUS_LABEL[s.status]}</span>
                </span>
            </div>
            <div class="detalhe-linha">
                <span class="campo">Entrada</span>
                <span class="valor">${formatarData(s.data_entrada)}</span>
            </div>
            <div class="detalhe-linha">
                <span class="campo">Previsão</span>
                <span class="valor">${formatarData(s.previsao_entrega)}</span>
            </div>
            ${s.observacoes ? `
            <div class="detalhe-linha">
                <span class="campo">Observações</span>
                <span class="valor">${s.observacoes}</span>
            </div>` : ""}
        </div>

        <div class="botoes-acao">
            ${botoesStatus}
            <button class="btn-secondary" onclick="abrirModalEditar()">✏️ Editar</button>
            ${s.status !== "concluido" && s.status !== "cancelado"
                ? `<button class="btn-danger" onclick="cancelarServico()">🚫 Cancelar serviço</button>`
                : ""
            }
        </div>
    `;
}

function gerarBotoesStatus(status) {
    if (status === "agendado") {
        return `<button class="btn-primary" onclick="mudarStatus('em_andamento')">
            🔵 Marcar como Em andamento
        </button>`;
    }
    if (status === "em_andamento") {
        return `<button class="btn-success" onclick="mudarStatus('concluido')">
            ✅ Marcar como Concluído
        </button>`;
    }
    return "";
}

async function mudarStatus(novoStatus) {
    try {
        const res = await fetch(`${API_URL}/servicos/${servicoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus })
        });

        if (!res.ok) throw new Error();

        servicoAtual = await res.json();
        renderizarDetalhe(servicoAtual);

    } catch (erro) {
        alert("Erro ao atualizar status.");
    }
}

async function cancelarServico() {
    if (!confirm("Tem certeza que deseja cancelar este serviço?")) return;

    try {
        const res = await fetch(`${API_URL}/servicos/${servicoId}/cancelar`, {
            method: "PATCH"
        });

        if (!res.ok) throw new Error();

        servicoAtual = await res.json();
        renderizarDetalhe(servicoAtual);

    } catch (erro) {
        alert("Erro ao cancelar serviço.");
    }
}

function abrirModalEditar() {
    document.getElementById("edit-previsao").value = servicoAtual.previsao_entrega;
    document.getElementById("edit-observacoes").value = servicoAtual.observacoes || "";
    document.getElementById("modal-editar").classList.add("aberto");
}

function fecharModal() {
    document.getElementById("modal-editar").classList.remove("aberto");
}

async function salvarEdicao() {
    const previsao = document.getElementById("edit-previsao").value;
    const observacoes = document.getElementById("edit-observacoes").value.trim();

    try {
        const res = await fetch(`${API_URL}/servicos/${servicoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                previsao_entrega: previsao,
                observacoes: observacoes || null
            })
        });

        if (!res.ok) throw new Error();

        servicoAtual = await res.json();
        fecharModal();
        renderizarDetalhe(servicoAtual);

    } catch (erro) {
        alert("Erro ao salvar edição.");
    }
}

carregarDetalhe();