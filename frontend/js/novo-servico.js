let clienteSelecionadoId = null;
let tiposSelecionados = [];
let debounceTimer;

document.getElementById("data-entrada").value = dataHoje();

// ── CARREGAR TIPOS DE SERVIÇO DO BANCO ──
async function carregarTiposServico() {
    try {
        const res = await fetch(`${API_URL}/tipos-servico/`);
        const tipos = await res.json();
        renderizarTipos(tipos);
    } catch (erro) {
        console.error("Erro ao carregar tipos:", erro);
    }
}

function renderizarTipos(tipos) {
    const container = document.getElementById("tipos-container");

    if (tipos.length === 0) {
        container.innerHTML = `
            <p style="font-size:0.82rem; color:var(--vermelho)">
                Nenhum tipo cadastrado. 
                <span style="text-decoration:underline; cursor:pointer" onclick="abrirModalNovoTipo()">
                    Cadastrar agora
                </span>
            </p>
        `;
        return;
    }

    container.innerHTML = tipos.map(t => `
        <div class="tipo-item" id="tipo-${t.id}" onclick="toggleTipo(${t.id}, '${t.nome}')">
            ${t.nome}
        </div>
    `).join("");
}

function toggleTipo(id, nome) {
    const el = document.getElementById(`tipo-${id}`);
    const index = tiposSelecionados.findIndex(t => t.id === id);

    if (index === -1) {
        tiposSelecionados.push({ id, nome });
        el.classList.add("selecionado");
    } else {
        tiposSelecionados.splice(index, 1);
        el.classList.remove("selecionado");
    }
}

// ── AUTOCOMPLETE DE CLIENTE ──
async function buscarClienteAutocomplete(termo) {
    const lista = document.getElementById("autocomplete-lista");
    clienteSelecionadoId = null;
    document.getElementById("cliente-id-selecionado").value = "";

    clearTimeout(debounceTimer);

    if (termo.trim().length < 2) {
        lista.style.display = "none";
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${API_URL}/clientes/buscar/${encodeURIComponent(termo)}`);
            const clientes = await res.json();

            if (clientes.length === 0) {
                lista.style.display = "none";
                return;
            }

            lista.innerHTML = clientes.map(c => `
                <div class="autocomplete-item" onclick="selecionarCliente(${c.id}, '${c.nome}')">
                    <div>${c.nome}</div>
                    <div class="telefone">📞 ${c.telefone}</div>
                </div>
            `).join("");

            lista.style.display = "block";

        } catch (erro) {
            console.error(erro);
        }
    }, 300);
}

function selecionarCliente(id, nome) {
    clienteSelecionadoId = id;
    document.getElementById("input-cliente").value = nome;
    document.getElementById("cliente-id-selecionado").value = id;
    document.getElementById("autocomplete-lista").style.display = "none";
}

// ── MODAL NOVO CLIENTE ──
function abrirModalNovoCliente() {
    document.getElementById("novo-cliente-nome").value = "";
    document.getElementById("novo-cliente-telefone").value = "";
    document.getElementById("modal-cliente").classList.add("aberto");
}

// ── MODAL NOVO TIPO ──
function abrirModalNovoTipo() {
    document.getElementById("novo-tipo-nome").value = "";
    document.getElementById("modal-tipo").classList.add("aberto");
}

function fecharModal() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("aberto"));
}

async function salvarNovoCliente() {
    const nome = document.getElementById("novo-cliente-nome").value.trim();
    const telefone = document.getElementById("novo-cliente-telefone").value.trim();

    if (!nome || !telefone) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/clientes/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone })
        });

        if (!res.ok) throw new Error();

        const cliente = await res.json();
        selecionarCliente(cliente.id, cliente.nome);
        fecharModal();

    } catch (erro) {
        alert("Erro ao cadastrar cliente.");
    }
}

async function salvarNovoTipo() {
    const nome = document.getElementById("novo-tipo-nome").value.trim();

    if (!nome) {
        alert("Digite o nome do tipo de serviço.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/tipos-servico/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome })
        });

        if (!res.ok) {
            const erro = await res.json();
            alert(erro.detail);
            return;
        }

        fecharModal();
        carregarTiposServico();

    } catch (erro) {
        alert("Erro ao cadastrar tipo de serviço.");
    }
}

// ── CADASTRAR SERVIÇO ──
async function cadastrarServico() {
    const clienteId = document.getElementById("cliente-id-selecionado").value;
    const observacoes = document.getElementById("observacoes").value.trim();
    const dataEntrada = document.getElementById("data-entrada").value;
    const previsao = document.getElementById("previsao-entrega").value;

    if (!clienteId) {
        alert("Selecione um cliente.");
        return;
    }
    if (tiposSelecionados.length === 0) {
        alert("Selecione ao menos um tipo de serviço.");
        return;
    }
    if (!dataEntrada || !previsao) {
        alert("Preencha as datas.");
        return;
    }
    if (previsao < dataEntrada) {
        alert("A previsão de entrega não pode ser anterior à data de entrada.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/servicos/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente_id: parseInt(clienteId),
                tipos_ids: tiposSelecionados.map(t => t.id),
                observacoes: observacoes || null,
                data_entrada: dataEntrada,
                previsao_entrega: previsao
            })
        });

        if (!res.ok) {
            const erro = await res.json();
            alert(erro.detail);
            return;
        }

        window.location.href = "index.html";

    } catch (erro) {
        alert("Erro ao cadastrar serviço. Tente novamente.");
    }
}

carregarTiposServico();