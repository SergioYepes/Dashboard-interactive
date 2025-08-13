from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes.upload import get_db
from app.Dmodels.trained_model import TrainedModel
from pydantic import BaseModel
from typing import List

router= APIRouter(prefix="/models", tags=["models"])

class ModelCreate(BaseModel):
    name:str
    config: dict
    metrics: dict

class ModelOut(ModelCreate):
    id:int
    created_at:str
    class Config:
        orm_mode: True
@router.post("/", response_model=ModelOut)
def create_model(model: ModelCreate, db: Session = Depends(get_db)):
    db_model = TrainedModel(**model.model_dump())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db.model
@router.get("/", response_model=List[ModelOut])
def list_models(db: Session = Depends(get_db)):
    return db.query(TrainedModel).all()
@router.get("/{model_id}", response_model=ModelOut)
def get_model_byId(model_id: int, db: Session = Depends(get_db)):
    model= db.query(TrainedModel).get(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model