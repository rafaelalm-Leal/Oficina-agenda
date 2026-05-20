from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/clientes", tags=["Clientes"])

# LISTAR TODOS OS CLIENTES
@router.get("/", response_model=list[schemas.ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(models.Cliente).order_by(models.Cliente.nome).all()

# BUSCAR CLIENTE POR ID
@router.get("/{cliente_id}", response_model=schemas.ClienteResponse)
def buscar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

# BUSCAR CLIENTE POR NOME
@router.get("/buscar/{nome}", response_model=list[schemas.ClienteResponse])
def buscar_por_nome(nome: str, db: Session = Depends(get_db)):
    return db.query(models.Cliente).filter(
        models.Cliente.nome.ilike(f"%{nome}%")
    ).all()

# CADASTRAR NOVO CLIENTE
@router.post("/", response_model=schemas.ClienteResponse, status_code=201)
def criar_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    novo_cliente = models.Cliente(**cliente.model_dump())
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

# EDITAR CLIENTE
@router.put("/{cliente_id}", response_model=schemas.ClienteResponse)
def editar_cliente(cliente_id: int, dados: schemas.ClienteCreate, db: Session = Depends(get_db)):
    cliente = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    for campo, valor in dados.model_dump().items():
        setattr(cliente, campo, valor)
    db.commit()
    db.refresh(cliente)
    return cliente

# DELETAR CLIENTE
@router.delete("/{cliente_id}", status_code=204)
def deletar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    db.delete(cliente)
    db.commit()