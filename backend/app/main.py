from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload
from app.database import Base,engine
from app.routes import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models.router)

app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "API running"}
