from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/tipos-servico", tags=["Tipos de Serviço"])

# LISTAR TODOS
@router.get("/", response_model=list[schemas.TipoServicoResponse])
def listar_tipos(db: Session = Depends(get_db)):
    return db.query(models.TipoServico).order_by(models.TipoServico.nome).all()

# CRIAR NOVO TIPO
@router.post("/", response_model=schemas.TipoServicoResponse, status_code=201)
def criar_tipo(tipo: schemas.TipoServicoCreate, db: Session = Depends(get_db)):
    existente = db.query(models.TipoServico).filter(
        models.TipoServico.nome.ilike(tipo.nome)
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Tipo de serviço já cadastrado")
    novo = models.TipoServico(nome=tipo.nome)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

# EDITAR TIPO
@router.put("/{tipo_id}", response_model=schemas.TipoServicoResponse)
def editar_tipo(tipo_id: int, dados: schemas.TipoServicoCreate, db: Session = Depends(get_db)):
    tipo = db.query(models.TipoServico).filter(models.TipoServico.id == tipo_id).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo não encontrado")
    tipo.nome = dados.nome
    db.commit()
    db.refresh(tipo)
    return tipo

# DELETAR TIPO
@router.delete("/{tipo_id}", status_code=204)
def deletar_tipo(tipo_id: int, db: Session = Depends(get_db)):
    tipo = db.query(models.TipoServico).filter(models.TipoServico.id == tipo_id).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo não encontrado")
    db.delete(tipo)
    db.commit()