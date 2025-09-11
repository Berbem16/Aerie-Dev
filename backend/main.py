from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

import models
import schemas
import database

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 