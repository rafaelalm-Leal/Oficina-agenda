from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.models import StatusServico

router = APIRouter(prefix="/servicos", tags=["Serviços"])

LIMITE_SERVICOS_ATIVOS = 4

def contar_servicos_ativos(db: Session) -> int:
    return db.query(models.Servico).filter(
        models.Servico.status.in_([
            StatusServico.agendado,
            StatusServico.em_andamento
        ])
    ).count()

# LISTAR TODOS
@router.get("/", response_model=list[schemas.ServicoResponse])
def listar_servicos(db: Session = Depends(get_db)):
    return db.query(models.Servico).order_by(models.Servico.previsao_entrega).all()

# LISTAR POR STATUS
@router.get("/status/{status}", response_model=list[schemas.ServicoResponse])
def listar_por_status(status: StatusServico, db: Session = Depends(get_db)):
    return db.query(models.Servico).filter(
        models.Servico.status == status
    ).order_by(models.Servico.previsao_entrega).all()

# DASHBOARD
@router.get("/dashboard/resumo")
def resumo_dashboard(db: Session = Depends(get_db)):
    agendados = db.query(models.Servico).filter(
        models.Servico.status == StatusServico.agendado
    ).count()
    em_andamento = db.query(models.Servico).filter(
        models.Servico.status == StatusServico.em_andamento
    ).count()
    concluidos = db.query(models.Servico).filter(
        models.Servico.status == StatusServico.concluido
    ).count()
    ativos = agendados + em_andamento
    lotado = ativos >= LIMITE_SERVICOS_ATIVOS

    return {
        "agendados": agendados,
        "em_andamento": em_andamento,
        "concluidos": concluidos,
        "slots_usados": ativos,
        "slots_total": LIMITE_SERVICOS_ATIVOS,
        "lotado": lotado
    }

# BUSCAR POR ID
@router.get("/{servico_id}", response_model=schemas.ServicoResponse)
def buscar_servico(servico_id: int, db: Session = Depends(get_db)):
    servico = db.query(models.Servico).filter(models.Servico.id == servico_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return servico

# CRIAR SERVIÇO
@router.post("/", response_model=schemas.ServicoResponse, status_code=201)
def criar_servico(servico: schemas.ServicoCreate, db: Session = Depends(get_db)):
    ativos = contar_servicos_ativos(db)
    if ativos >= LIMITE_SERVICOS_ATIVOS:
        raise HTTPException(
            status_code=400,
            detail=f"Limite de {LIMITE_SERVICOS_ATIVOS} serviços ativos atingido."
        )
    if not servico.tipos_ids:
        raise HTTPException(status_code=400, detail="Selecione ao menos um tipo de serviço.")

    novo = models.Servico(
        cliente_id=servico.cliente_id,
        observacoes=servico.observacoes,
        data_entrada=servico.data_entrada,
        previsao_entrega=servico.previsao_entrega
    )
    db.add(novo)
    db.flush()

    for tipo_id in servico.tipos_ids:
        tipo = db.query(models.TipoServico).filter(models.TipoServico.id == tipo_id).first()
        if not tipo:
            raise HTTPException(status_code=404, detail=f"Tipo de serviço {tipo_id} não encontrado")
        item = models.ItemServico(servico_id=novo.id, tipo_servico_id=tipo_id)
        db.add(item)

    db.commit()
    db.refresh(novo)
    return novo

# ATUALIZAR SERVIÇO
@router.patch("/{servico_id}", response_model=schemas.ServicoResponse)
def atualizar_servico(servico_id: int, dados: schemas.ServicoUpdate, db: Session = Depends(get_db)):
    servico = db.query(models.Servico).filter(models.Servico.id == servico_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    if dados.observacoes is not None:
        servico.observacoes = dados.observacoes
    if dados.previsao_entrega is not None:
        servico.previsao_entrega = dados.previsao_entrega
    if dados.status is not None:
        servico.status = dados.status

    if dados.tipos_ids is not None:
        if not dados.tipos_ids:
            raise HTTPException(status_code=400, detail="Selecione ao menos um tipo de serviço.")
        for item in servico.itens:
            db.delete(item)
        for tipo_id in dados.tipos_ids:
            tipo = db.query(models.TipoServico).filter(models.TipoServico.id == tipo_id).first()
            if not tipo:
                raise HTTPException(status_code=404, detail=f"Tipo {tipo_id} não encontrado")
            db.add(models.ItemServico(servico_id=servico.id, tipo_servico_id=tipo_id))

    db.commit()
    db.refresh(servico)
    return servico

# CANCELAR
@router.patch("/{servico_id}/cancelar", response_model=schemas.ServicoResponse)
def cancelar_servico(servico_id: int, db: Session = Depends(get_db)):
    servico = db.query(models.Servico).filter(models.Servico.id == servico_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    if servico.status == StatusServico.concluido:
        raise HTTPException(status_code=400, detail="Não é possível cancelar um serviço já concluído")
    servico.status = StatusServico.cancelado
    db.commit()
    db.refresh(servico)
    return servico

# DELETAR
@router.delete("/{servico_id}", status_code=204)
def deletar_servico(servico_id: int, db: Session = Depends(get_db)):
    servico = db.query(models.Servico).filter(models.Servico.id == servico_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    db.delete(servico)
    db.commit()