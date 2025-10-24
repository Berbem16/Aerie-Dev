from fastapi import FastAPI, HTTPException, Depends, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from pathlib import Path
from datetime import datetime, timezone
import math

import models, schemas, searches, database
from database import Base, engine, ensure_schema, get_db
from uploads import router as uploads_router

# Create database tables
app = FastAPI(title="UAS Reporting Tool", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path("static")
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(uploads_router)

Base.metadata.create_all(bind=engine)
ensure_schema()

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
    unit:       Optional[str] = Query(None, description="Unit name to search for"),
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

    # Unit filtering
    if unit is not None:
        q = q.filter(models.UASSighting.unit.ilike(f"%{unit}%"))

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

@app.get("/sightings/search/mgrs", response_model=List[schemas.UASSighting])
def search_sightings_by_mgrs(
    mgrs: str = Query(..., description="MGRS string, e.g. 18SUJ234678 or '18S UJ 234 678'"),
    radius_km: float = Query(..., gt=0, le=1000, description="Search radius in kilometers"),
    start_time: Optional[str] = Query(None, description="ISO e.g. 2025-09-11T14:30"),
    end_time:   Optional[str] = Query(None, description="ISO e.g. 2025-09-11T16:00"),
    db: Session = Depends(database.get_db),
):
    # Validate time args (both or neither)
    q = db.query(models.UASSighting)
    if (start_time is None) ^ (end_time is None):
        raise HTTPException(status_code=400, detail="Provide both start_time and end_time or neither.")

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

    # Convert MGRS -> center point
    try:
        center_lat, center_lon = searches.mgrs_to_latlon(mgrs)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid MGRS coordinate")

    # Bounding box prefilter for performance
    lat_pad = radius_km / 111.0
    lon_pad = radius_km / (111.0 * max(0.1, math.cos(math.radians(center_lat))))
    lat_min, lat_max = center_lat - lat_pad, center_lat + lat_pad
    lon_min, lon_max = center_lon - lon_pad, center_lon + lon_pad

    candidates = (
        q.filter(models.UASSighting.latitude.between(lat_min, lat_max))
         .filter(models.UASSighting.longitude.between(lon_min, lon_max))
         .all()
    )

    inside: List[models.UASSighting] = []
    for s in candidates:
        dist = searches.haversine(center_lat, center_lon, s.latitude, s.longitude)
        if dist <= radius_km:
            inside.append(s)

    # Sort by distance ascending for nicer UX
    inside.sort(key=lambda s: searches.haversine(center_lat, center_lon, s.latitude, s.longitude))
    return inside

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 