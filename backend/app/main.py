from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload
from app.database import Base,engine
from app.routes import models
from app.routes import dataframes
from app.routes import sql
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configurar CORS para producción y desarrollo
origins = [
    "http://localhost:3000",  # Desarrollo local
    "https://*.vercel.app",   # Vercel domains
    "https://*.onrender.com", # Render domains
]

# Permitir todos los orígenes en desarrollo
if os.getenv("ENVIRONMENT") != "production":
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models.router)
app.include_router(upload.router)
app.include_router(dataframes.router)
app.include_router(sql.router)

@app.get("/")
def root():
    return {"message": "API running"}
