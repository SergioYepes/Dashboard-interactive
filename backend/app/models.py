from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from datetime import datetime, timezone
from .database import Base

class Dataset(Base):
    __tablename__ = "datasets"
    id= Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(String(500), index=True)
    columns= Column(JSON)
    uploaded_at= Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
class MLModel(Base):
    __tablename__= "MLModels"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    config = Column(JSON)
    metrics = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))