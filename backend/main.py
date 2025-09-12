from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
import os

import models
import schemas
import database
import searches

# Create database tables
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="UAS Reporting Tool", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "UAS Reporting Tool API"}

@app.get("/sightings", response_model=List[schemas.UASSighting])
def get_sightings(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    sightings = db.query(models.UASSighting).offset(skip).limit(limit).all()
    return sightings

@app.post("/sightings", response_model=schemas.UASSighting)
def create_sighting(sighting: schemas.UASSightingCreate, db: Session = Depends(database.get_db)):
    db_sighting = models.UASSighting(**sighting.dict())
    db.add(db_sighting)
    db.commit()
    db.refresh(db_sighting)
    return db_sighting

@app.get("/sightings/{sighting_id}", response_model=schemas.UASSighting)
def get_sighting(sighting_id: int, db: Session = Depends(database.get_db)):
    sighting = db.query(models.UASSighting).filter(models.UASSighting.id == sighting_id).first()
    if sighting is None:
        raise HTTPException(status_code=404, detail="Sighting not found")
    return sighting
# Search UAS sightings by time range
@app.get("/sightings/search/time", response_model=List[schemas.UASSighting])
def search_sightings_by_time(
    start_time: str,
    end_time: str,
    db: Session = Depends(database.get_db)
):
    try:
        start_dt = datetime.fromisoformat(start_time)
        end_dt = datetime.fromisoformat(end_time)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)")
    if end_dt < start_dt:
        raise HTTPException(status_code=400, detail="end_time must be >= start_time")
    return searches.search_by_time_range(db, start_dt, end_dt)

@app.get("/sightings/search/proximity", response_model=List[schemas.UASSighting])
def search_sightings_by_proximity(
    latitude: float,
    longitude: float,
    radius_km: float,
    db: Session = Depends(database.get_db),
):
    return searches.search_by_proximity(db, latitude, longitude, radius_km)

# ---------------------------
# NEW: Combined search API
# ---------------------------
# Allows any combination of time range and proximity in one call.
# Examples:
#   /sightings/search?start_time=2025-09-10T09:00&end_time=2025-09-10T17:00
#   /sightings/search?latitude=49.45&longitude=7.56&radius_km=5
#   /sightings/search?start_time=2025-09-10T09:00&end_time=2025-09-10T17:00&latitude=49.45&longitude=7.56&radius_km=5
@app.get("/sightings/search", response_model=List[schemas.UASSighting])
def search_sightings_combined(
    start_time: Optional[str] = Query(None, description="ISO format e.g. 2025-09-11T14:30"),
    end_time:   Optional[str] = Query(None, description="ISO format e.g. 2025-09-11T16:00"),
    latitude:   Optional[float] = Query(None),
    longitude:  Optional[float] = Query(None),
    radius_km:  Optional[float] = Query(None),
    db: Session = Depends(database.get_db),
):
    # Start with a base query
    q = db.query(models.UASSighting)

    # Time filtering (only if both provided)
    if start_time is not None and end_time is not None:
        try:
            start_dt = datetime.fromisoformat(start_time)
            end_dt = datetime.fromisoformat(end_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)")
        if end_dt < start_dt:
            raise HTTPException(status_code=400, detail="end_time must be >= start_time")
        q = q.filter(and_(models.UASSighting.time >= start_dt,
                          models.UASSighting.time <= end_dt))

    # Execute DB query (time-filtered or all)
    results = q.all()

    # Proximity filtering (only if all three provided)
    if latitude is not None and longitude is not None and radius_km is not None:
        # Reuse haversine from searches.py
        filtered = []
        for s in results:
            dist = searches.haversine(latitude, longitude, s.latitude, s.longitude)
            if dist <= radius_km:
                filtered.append(s)
        return filtered

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 