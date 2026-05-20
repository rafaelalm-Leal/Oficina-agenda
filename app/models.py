from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class StatusServico(enum.Enum):
    agendado = "agendado"
    em_andamento = "em_andamento"
    concluido = "concluido"
    cancelado = "cancelado"

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    telefone = Column(String(20), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    servicos = relationship("Servico", back_populates="cliente")

class TipoServico(Base):
    __tablename__ = "tipos_servico"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, unique=True)

class ItemServico(Base):
    __tablename__ = "itens_servico"

    id = Column(Integer, primary_key=True, index=True)
    servico_id = Column(Integer, ForeignKey("servicos.id"), nullable=False)
    tipo_servico_id = Column(Integer, ForeignKey("tipos_servico.id"), nullable=False)

    servico = relationship("Servico", back_populates="itens")
    tipo = relationship("TipoServico")

class Servico(Base):
    __tablename__ = "servicos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    observacoes = Column(Text, nullable=True)
    data_entrada = Column(Date, nullable=False)
    previsao_entrega = Column(Date, nullable=False)
    status = Column(Enum(StatusServico), default=StatusServico.agendado)
    criado_em = Column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="servicos")
    itens = relationship("ItemServico", back_populates="servico", cascade="all, delete-orphan")