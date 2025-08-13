from fastapi import APIRouter, HTTPException
import pandas as pd
import os
from typing import List, Dict, Any
from pydantic import BaseModel
import sqlite3
import tempfile

router = APIRouter(prefix="/sql", tags=["sql"])

DATAFRAMES_PATH = "Dataframes"

class SQLQuery(BaseModel):
    query: str

class SQLResult(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int
    execution_time: float

@router.post("/execute", response_model=SQLResult)
def execute_sql_query(sql_request: SQLQuery):
    """Ejecuta una consulta SQL en los dataframes disponibles"""
    import time
    
    start_time = time.time()
    
    try:
        # Crear una base de datos temporal en memoria
        conn = sqlite3.connect(':memory:')
        
        # Cargar todos los dataframes disponibles como tablas
        loaded_tables = []
        
        if not os.path.exists(DATAFRAMES_PATH):
            raise HTTPException(status_code=404, detail="Carpeta de dataframes no encontrada")
        
        for filename in os.listdir(DATAFRAMES_PATH):
            if filename.endswith('.csv'):
                file_path = os.path.join(DATAFRAMES_PATH, filename)
                table_name = filename.replace('.csv', '').replace('-', '_')
                
                try:
                    # Leer el dataframe
                    df = pd.read_csv(file_path)
                    
                    # Limpiar nombres de columnas para SQL
                    df.columns = [col.replace(' ', '_').replace('-', '_').replace('.', '_') for col in df.columns]
                    
                    # Cargar en la base de datos temporal
                    df.to_sql(table_name, conn, if_exists='replace', index=False)
                    loaded_tables.append(table_name)
                    
                except Exception as e:
                    print(f"Error cargando {filename}: {str(e)}")
                    continue
        
        if not loaded_tables:
            raise HTTPException(status_code=500, detail="No se pudieron cargar dataframes")
        
        # Ejecutar la consulta SQL
        query = sql_request.query.strip()
        
        # Validaciones básicas de seguridad
        if any(keyword in query.upper() for keyword in ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER']):
            raise HTTPException(status_code=400, detail="Consultas de modificación no están permitidas")
        
        # Ejecutar la consulta
        result_df = pd.read_sql_query(query, conn)
        
        # Convertir a formato JSON
        data = result_df.to_dict('records')
        
        # Limpiar datos NaN
        for row in data:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
        
        execution_time = time.time() - start_time
        
        return SQLResult(
            data=data,
            columns=result_df.columns.tolist(),
            row_count=len(data),
            execution_time=execution_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ejecutando consulta SQL: {str(e)}")
    
    finally:
        if 'conn' in locals():
            conn.close()

@router.get("/tables")
def get_available_tables():
    """Obtiene la lista de tablas disponibles para consultas SQL"""
    tables = []
    
    if not os.path.exists(DATAFRAMES_PATH):
        raise HTTPException(status_code=404, detail="Carpeta de dataframes no encontrada")
    
    for filename in os.listdir(DATAFRAMES_PATH):
        if filename.endswith('.csv'):
            table_name = filename.replace('.csv', '').replace('-', '_')
            
            try:
                file_path = os.path.join(DATAFRAMES_PATH, filename)
                df = pd.read_csv(file_path, nrows=1)  # Solo leer la primera fila para obtener columnas
                
                tables.append({
                    "table_name": table_name,
                    "filename": filename,
                    "columns": df.columns.tolist(),
                    "file_size": f"{os.path.getsize(file_path) / (1024*1024):.2f} MB"
                })
                
            except Exception as e:
                print(f"Error obteniendo información de {filename}: {str(e)}")
                continue
    
    return {"tables": tables}

@router.get("/tables/{table_name}/schema")
def get_table_schema(table_name: str):
    """Obtiene el esquema de una tabla específica"""
    filename = f"{table_name}.csv"
    file_path = os.path.join(DATAFRAMES_PATH, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Tabla {table_name} no encontrada")
    
    try:
        df = pd.read_csv(file_path, nrows=1000)  # Leer algunas filas para análisis
        
        schema = []
        for col in df.columns:
            col_info = {
                "column_name": col,
                "data_type": str(df[col].dtype),
                "null_count": df[col].isnull().sum(),
                "unique_count": df[col].nunique(),
                "sample_values": df[col].dropna().head(5).tolist()
            }
            schema.append(col_info)
        
        return {
            "table_name": table_name,
            "filename": filename,
            "schema": schema,
            "total_rows": len(df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo esquema: {str(e)}")
