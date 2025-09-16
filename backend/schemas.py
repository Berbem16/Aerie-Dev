from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UASSightingBase(BaseModel):
    type_of_sighting: str
    time: datetime
    latitude: float
    longitude: float
    location_name: str
    description: str
    symbol_code: Optional[str] = None
    image_urls: List[str] = []

class UASSightingCreate(UASSightingBase):
    pass

class UASSighting(UASSightingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True 