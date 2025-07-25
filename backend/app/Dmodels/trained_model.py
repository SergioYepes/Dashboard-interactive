from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from app.database import Base

class TrainedModel(Base):
    __tablename__ ="models"
    id = Column(Integer, primary_key=True, index=True)
    name= Column(String, nullable=False)
    config= Column(JSON, nullable=False)
    metrics= Column(JSON, nullable=False)
    created_at =Column(DateTime, server_default=func.now())