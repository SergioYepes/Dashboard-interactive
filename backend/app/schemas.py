from pydantic import BaseModel
from typing import List,Dict, any

class DatasetCreate(BaseModel):
    name:str
    columns: List[str]

class DatasetOut(BaseModel):
    id:int
    name:str
    columns: List[str]

