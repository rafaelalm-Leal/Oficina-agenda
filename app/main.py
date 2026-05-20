from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import clientes, servicos, tipo_servico

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Oficina Agenda")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(servicos.router)
app.include_router(tipo_servico.router)

@app.get("/")
def root():
    return {"mensagem": "Oficina Agenda API funcionando!"}