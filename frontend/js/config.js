const API_URL = "http://127.0.0.1:8000";

const TIPOS_SERVICO = [
    "Pintura total",
    "Funilaria", 
    "Polimento",
    "Limpeza simples"
];

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