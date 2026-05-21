const CACHE_NAME = "oficina-agenda-v1";

const ARQUIVOS_CACHE = [
    "/",
    "/index.html",
    "/servicos.html",
    "/clientes.html",
    "/novo-servico.html",
    "/detalhe.html",
    "/css/style.css",
    "/js/config.js",
    "/js/dashboard.js",
    "/js/servicos.js",
    "/js/clientes.js",
    "/js/novo-servico.js",
    "/js/detalhe.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS_CACHE))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(resposta => {
            return resposta || fetch(event.request);
        })
    );
});