from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import database

try: 
    from sqlalchemy.dialects.postgresql import JSONB
    JSONType = JSONB
    DEFAULT_IMAGE_URLS = text("'[]'::jsonb")
except Exception:
    from sqlalchemy import JSON as GenericJSON
    JSONType = GenericJSON
    DEFAULT_IMAGE_URLS = text("'[]'::json")

class UASSighting(database.Base):
    __tablename__ = "uas_sightings"

    id = Column(Integer, primary_key=True, index=True)
    type_of_sighting = Column(String(255), nullable=False)
    time = Column(DateTime(timezone=True), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    symbol_code = Column(String(50), nullable=True)
    ascc = Column(String(100), nullable=True)
    unit = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    image_urls = Column(JSONType, nullable=False, server_default=DEFAULT_IMAGE_URLS)

class ChatSession(database.Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(255), nullable=False, index=True)  # For multi-user support
    title = Column(String(255), nullable=True)  # Auto-generated from first message or user-defined
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to messages
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(database.Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to session
    session = relationship("ChatSession", back_populates="messages") 