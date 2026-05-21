const API_URL = window.location.hostname === "127.0.0.1" || 
                window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://SEU-BACKEND.onrender.com";

const STATUS_LABEL = {
    agendado: "Agendado",
    em_andamento: "Em andamento",
    concluido: "Concluído",
    cancelado: "Cancelado"
};

function formatarData(dataStr) {
    if (!dataStr) return "—";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
}

function dataHoje() {
    return new Date().toISOString().split("T")[0];
}