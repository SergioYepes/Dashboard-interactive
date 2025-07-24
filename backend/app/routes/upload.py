from fastapi import APIRouter, File, UploadFile, Depends
import pandas as pd
import tempfile
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Dataset

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df=pd.read_csv(file.file)
    dataset=Dataset(name=file.filename, columns=df.columns.tolist())
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return {
        "id": dataset.id,
        "columns": df.columns.tolist(),
        "preview": df.head().to_dict(orient="records")
    }
