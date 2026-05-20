from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from app.models import StatusServico

# ─────────────────────────────────────────
# SCHEMAS DE CLIENTE
# ─────────────────────────────────────────

class ClienteBase(BaseModel):
    nome: str
    telefone: str

class ClienteCreate(ClienteBase):
    pass

class ClienteResponse(ClienteBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────
# SCHEMAS DE TIPO DE SERVIÇO
# ─────────────────────────────────────────

class TipoServicoBase(BaseModel):
    nome: str

class TipoServicoCreate(TipoServicoBase):
    pass

class TipoServicoResponse(TipoServicoBase):
    id: int

    class Config:
        from_attributes = True

# ─────────────────────────────────────────
# SCHEMAS DE ITEM DE SERVIÇO
# ─────────────────────────────────────────

class ItemServicoResponse(BaseModel):
    id: int
    tipo: TipoServicoResponse

    class Config:
        from_attributes = True

# ─────────────────────────────────────────
# SCHEMAS DE SERVIÇO
# ─────────────────────────────────────────

class ServicoBase(BaseModel):
    observacoes: Optional[str] = None
    data_entrada: date
    previsao_entrega: date

class ServicoCreate(ServicoBase):
    cliente_id: int
    tipos_ids: List[int]

class ServicoUpdate(BaseModel):
    observacoes: Optional[str] = None
    previsao_entrega: Optional[date] = None
    status: Optional[StatusServico] = None
    tipos_ids: Optional[List[int]] = None

class ServicoResponse(ServicoBase):
    id: int
    cliente_id: int
    status: StatusServico
    criado_em: datetime
    cliente: ClienteResponse
    itens: List[ItemServicoResponse]

    class Config:
        from_attributes = True