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
    ascc: Optional[str] = None
    unit: Optional[str] = None
    image_urls: List[str] = []

class UASSightingCreate(UASSightingBase):
    pass

class UASSighting(UASSightingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Chat schemas
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessage(ChatMessageBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class ChatSessionBase(BaseModel):
    title: Optional[str] = None
    user_name: str = "default_user"  # Default user, can be extended for multi-user

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[ChatMessage] = []

    class Config:
        orm_mode = True

class ChatSessionSummary(BaseModel):
    """Lightweight session info without full message history"""
    id: int
    title: Optional[str] = None
    user_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    message_count: int = 0

    class Config:
        orm_mode = True 