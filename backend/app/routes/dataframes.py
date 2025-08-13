from fastapi import APIRouter, HTTPException
import pandas as pd
import os
from typing import List, Dict, Any
import json
from pydantic import BaseModel

router = APIRouter(prefix="/dataframes", tags=["dataframes"])

# Ruta a la carpeta de dataframes
DATAFRAMES_PATH = "Dataframes"

class DataFrameInfo(BaseModel):
    id: str
    name: str
    description: str
    columns: List[str]
    row_count: int
    file_size: str

class DataFrameData(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]
    total_rows: int

@router.get("/", response_model=List[DataFrameInfo])
def list_dataframes():
    """Lista todos los dataframes disponibles"""
    dataframes = []
    
    if not os.path.exists(DATAFRAMES_PATH):
        raise HTTPException(status_code=404, detail="Carpeta de dataframes no encontrada")
    
    # Mapeo de nombres descriptivos para cada dataframe
    dataframe_descriptions = {
        "ncr_ride_bookings.csv": "Datos de reservas de viajes en taxi",
        "olist_customers_dataset.csv": "Dataset de clientes de Olist",
        "fundamentals.csv": "Datos fundamentales financieros",
        "pharmacy_otc_sales_data.csv": "Datos de ventas de farmacia OTC",
        "Iris.csv": "Dataset clásico de flores Iris"
    }
    
    for filename in os.listdir(DATAFRAMES_PATH):
        if filename.endswith('.csv'):
            file_path = os.path.join(DATAFRAMES_PATH, filename)
            
            try:
                # Leer solo las primeras filas para obtener información básica
                df = pd.read_csv(file_path, nrows=5)
                
                # Obtener información del archivo
                file_size = os.path.getsize(file_path)
                file_size_mb = f"{file_size / (1024*1024):.2f} MB"
                
                # Contar filas totales (para archivos grandes, esto puede ser lento)
                if file_size < 50 * 1024 * 1024:  # Si es menor a 50MB
                    df_full = pd.read_csv(file_path)
                    row_count = len(df_full)
                else:
                    # Para archivos grandes, estimar el número de filas
                    row_count = "Grande (>50MB)"
                
                dataframe_info = DataFrameInfo(
                    id=filename.replace('.csv', ''),
                    name=filename.replace('.csv', '').replace('_', ' ').title(),
                    description=dataframe_descriptions.get(filename, f"Datos de {filename}"),
                    columns=df.columns.tolist(),
                    row_count=row_count if isinstance(row_count, int) else 0,
                    file_size=file_size_mb
                )
                
                dataframes.append(dataframe_info)
                
            except Exception as e:
                print(f"Error leyendo {filename}: {str(e)}")
                continue
    
    return dataframes

@router.get("/{dataframe_id}/data", response_model=DataFrameData)
def get_dataframe_data(dataframe_id: str, limit: int = 100, offset: int = 0):
    """Obtiene datos de un dataframe específico con paginación"""
    filename = f"{dataframe_id}.csv"
    file_path = os.path.join(DATAFRAMES_PATH, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Dataframe {dataframe_id} no encontrado")
    
    try:
        # Leer el dataframe con paginación
        df = pd.read_csv(file_path, skiprows=range(1, offset + 1), nrows=limit)
        
        # Convertir a lista de diccionarios
        data = df.to_dict('records')
        
        # Limpiar datos NaN
        for row in data:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
        
        return DataFrameData(
            data=data,
            columns=df.columns.tolist(),
            total_rows=len(data)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error leyendo dataframe: {str(e)}")

@router.get("/{dataframe_id}/preview", response_model=DataFrameData)
def get_dataframe_preview(dataframe_id: str, rows: int = 10):
    """Obtiene una vista previa de un dataframe (primeras filas)"""
    return get_dataframe_data(dataframe_id, limit=rows, offset=0)

@router.get("/{dataframe_id}/info")
def get_dataframe_info(dataframe_id: str):
    """Obtiene información detallada de un dataframe"""
    filename = f"{dataframe_id}.csv"
    file_path = os.path.join(DATAFRAMES_PATH, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Dataframe {dataframe_id} no encontrado")
    
    try:
        # Leer solo las primeras filas para obtener información
        df = pd.read_csv(file_path, nrows=1000)
        
        # Obtener información del archivo
        file_size = os.path.getsize(file_path)
        file_size_mb = f"{file_size / (1024*1024):.2f} MB"
        
        # Información de columnas
        column_info = []
        for col in df.columns:
            col_info = {
                "name": col,
                "type": str(df[col].dtype),
                "null_count": df[col].isnull().sum(),
                "unique_count": df[col].nunique()
            }
            column_info.append(col_info)
        
        return {
            "id": dataframe_id,
            "filename": filename,
            "file_size": file_size_mb,
            "columns": column_info,
            "sample_data": df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo información: {str(e)}")
