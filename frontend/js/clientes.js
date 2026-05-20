let debounceTimer;

async function carregarClientes() {
    const lista = document.getElementById("lista-clientes");

    try {
        const res = await fetch(`${API_URL}/clientes/`);
        const clientes = await res.json();
        renderizarClientes(clientes);
    } catch (erro) {
        lista.innerHTML = `<p style="color:var(--vermelho)">Erro ao carregar clientes.</p>`;
    }
}

function renderizarClientes(clientes) {
    const lista = document.getElementById("lista-clientes");

    if (clientes.length === 0) {
        lista.innerHTML = `
            <div class="estado-vazio">
                <div class="icone">👥</div>
                <p>Nenhum cliente cadastrado ainda.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = clientes.map(c => `
        <div class="card-servico" onclick="abrirModalEditarCliente(${c.id}, '${c.nome}', '${c.telefone}')">
            <div class="card-servico-header">
                <span class="card-nome">${c.nome}</span>
                <span style="font-size:1.2rem">✏️</span>
            </div>
            <div class="card-servico-info">
                <span>📞 ${c.telefone}</span>
            </div>
        </div>
    `).join("");
}

function buscarClientes(termo) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        if (termo.trim() === "") {
            carregarClientes();
            return;
        }
        try {
            const res = await fetch(`${API_URL}/clientes/buscar/${encodeURIComponent(termo)}`);
            const clientes = await res.json();
            renderizarClientes(clientes);
        } catch (erro) {
            console.error(erro);
        }
    }, 300);
}

function abrirModalNovoCliente() {
    document.getElementById("modal-titulo").textContent = "Novo Cliente";
    document.getElementById("cliente-id").value = "";
    document.getElementById("cliente-nome").value = "";
    document.getElementById("cliente-telefone").value = "";
    document.getElementById("modal-cliente").classList.add("aberto");
}

function abrirModalEditarCliente(id, nome, telefone) {
    document.getElementById("modal-titulo").textContent = "Editar Cliente";
    document.getElementById("cliente-id").value = id;
    document.getElementById("cliente-nome").value = nome;
    document.getElementById("cliente-telefone").value = telefone;
    document.getElementById("modal-cliente").classList.add("aberto");
}

function fecharModal() {
    document.getElementById("modal-cliente").classList.remove("aberto");
}

async function salvarCliente() {
    const id = document.getElementById("cliente-id").value;
    const nome = document.getElementById("cliente-nome").value.trim();
    const telefone = document.getElementById("cliente-telefone").value.trim();

    if (!nome || !telefone) {
        alert("Preencha todos os campos.");
        return;
    }

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/clientes/${id}` : `${API_URL}/clientes/`;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone })
        });

        if (!res.ok) throw new Error("Erro ao salvar");

        fecharModal();
        carregarClientes();

    } catch (erro) {
        alert("Erro ao salvar cliente. Tente novamente.");
    }
}

carregarClientes();