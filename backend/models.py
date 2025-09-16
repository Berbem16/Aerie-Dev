from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
import database

try: 
    from sqlalchemy.dialects.postgresql import JSONB as JSON
except Exception:
    from sqlalchemy import JSON

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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    image_urls = Column(JSON, nullable=False, default=list) 