"""
Utility functions for searching UAS sightings by time range and proximity.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import List
from . import models

from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
# Function to search UAS sightings by time range and proximity
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    # convert decimal degrees to radians
    dlon = lon2 - lon1
    # haversine formula
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

def search_by_time_range(db: Session, start_time: datetime, end_time: datetime) -> List[models.UASSighting]:
# Function to search UAS sightings by time range and proximity
    return (
        db.query(models.UASSighting)
            .filter(and_(models.UASSighting.time >= start_time,
                         models.UASSighting.time <= end_time))
            .all()
    )

def search_by_proximity(db: Session, latitude: float, longitude: float, max_distance_km: float) -> List[models.UASSighting]:
# Function to search UAS sightings by proximity
    lat_delta = max_distance_km / 111.0
    lon_delta = max_distance_km / (111.0 * max(cos(radians(latitude)), 1e-6))

    candidates = (
        db.query(models.UASSighting)
          .filter(models.UASSighting.latitude.between(latitude - lat_delta, latitude + lat_delta))
          .filter(models.UASSighting.longitude.between(longitude - lon_delta, longitude + lon_delta))
          .all()
    )

    nearby = []
    for s in candidates:
        dist = haversine(latitude, longitude, s.latitude, s.longitude)
        if dist <= max_distance_km:
            nearby.append(s)
    return nearby