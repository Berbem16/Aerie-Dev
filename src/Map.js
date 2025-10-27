import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import './App.css';
import ms from 'milsymbol';

// Fix default marker icons for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create a custom Leaflet icon from milsymbol
const createMilitarySymbolIcon = (symbolCode) => {
  const code = symbolCode || '100310000000000000000000000000';
  
  try {
    const symbol = new ms.Symbol(code, {
      size: 50,
      strokeWidth: 2,
      frame: true,
      fill: true
    });
    
    const svgString = symbol.asSVG();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    return L.icon({
      iconUrl: url,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25]
    });
  } catch (error) {
    console.error('Error creating military symbol:', error);
    return L.Icon.Default.prototype;
  }
};

const Map = () => {
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [usingBackendResults, setUsingBackendResults] = useState(false);
  const [message, setMessage] = useState('');
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(null);
  const [militaryIcons, setMilitaryIcons] = useState({});
  const mapRef = useRef(null);
  const drawControlsRef = useRef(null);

  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  // Function to format datetime for display
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchSightings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/sightings`);
      if (response.ok) {
        const data = await response.json();
        setSightings(data);
        setFilteredSightings(data);
      }
    } catch (error) {
      console.error('Error fetching sightings:', error);
    }
  }, [API_URL]);

  // Function to search by circle on map
  const searchByCircle = useCallback(async (centerLat, centerLon, radiusKm) => {
    try {
      const params = new URLSearchParams();
      params.append('latitude', centerLat);
      params.append('longitude', centerLon);
      params.append('radius_km', radiusKm.toString());

      const url = `${API_URL}/sightings/search?` + params.toString();
      const resp = await fetch(url);
      
      if (!resp.ok) {
        const text = await resp.text();
        setMessage(`Search failed ${resp.status}: ${text}`);
        console.error('Search error:', text);
        return;
      }
      
      const data = await resp.json();
      setFilteredSightings(data);
      setUsingBackendResults(true);
      setMessage(`Found ${data.length} sighting(s) within ${radiusKm.toFixed(2)} km radius.`);
      
    } catch (err) {
      console.error('Error searching by circle:', err);
      setMessage('Error searching by circle.');
    }
  }, [API_URL]);

  // Function to handle circle drawing
  const handleCircleComplete = useCallback((lat, lng, radius) => {
    setCircleCenter({ lat, lng });
    setCircleRadius(radius);
    searchByCircle(lat, lng, radius);
  }, [searchByCircle]);

  // Map component with draw controls
  const MapWithDrawControls = () => {
    useMapEvents({
      ready() {
        const map = mapRef.current;
        if (!map) return;
        
        if (drawControlsRef.current) {
          map.removeControl(drawControlsRef.current);
        }

        const drawControl = new L.Control.Draw({
          position: 'topright',
          draw: {
            polyline: false,
            polygon: false,
            rectangle: false,
            marker: false,
            circlemarker: false,
            circle: true
          },
          edit: {
            featureGroup: new L.FeatureGroup(),
            remove: false
          }
        });

        map.addControl(drawControl);
        drawControlsRef.current = drawControl;

        map.on(L.Draw.Event.CREATED, (e) => {
          const layer = e.layer;
          const center = layer.getLatLng();
          const radius = layer.getRadius();
          const radiusKm = radius / 1000;

          handleCircleComplete(center.lat, center.lng, radiusKm);
        });

        map.on(L.Draw.Event.EDITED, (e) => {
          const layers = e.layers;
          layers.eachLayer((layer) => {
            if (layer instanceof L.Circle) {
              const center = layer.getLatLng();
              const radius = layer.getRadius();
              const radiusKm = radius / 1000;

              handleCircleComplete(center.lat, center.lng, radiusKm);
            }
          });
        });
      }
    });

    return null;
  };

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  // Effect to create military icons for sightings
  useEffect(() => {
    if (sightings.length === 0) return;
    
    const icons = {};
    sightings.forEach((sighting) => {
      if (sighting.symbol_code) {
        try {
          icons[sighting.id] = createMilitarySymbolIcon(sighting.symbol_code);
        } catch (error) {
          console.error('Error creating icon for sighting', sighting.id, error);
        }
      }
    });
    setMilitaryIcons(icons);
  }, [sightings]);

  return (
    <div className="map-page">
      <main className="App-main">
        {message && <div className="message">{message}</div>}
        
        {/* Clear Search Button */}
        {circleCenter && usingBackendResults && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => {
                setCircleCenter(null);
                setCircleRadius(null);
                setUsingBackendResults(false);
                setFilteredSightings(sightings);
                setMessage('');
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#FFFF00',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Search
            </button>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 250px)' }}>
          <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
              center={[49.4521, 7.5545]}
              zoom={10}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapWithDrawControls />
              
              {/* Show markers for filtered sightings */}
              {filteredSightings.map((sighting) => (
                <Marker
                  key={sighting.id}
                  position={[sighting.latitude, sighting.longitude]}
                  icon={militaryIcons[sighting.id] || L.Icon.Default.prototype}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#FFFF00' }}>
                        {sighting.type_of_sighting}
                      </h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>Time:</strong> {formatDateTime(sighting.time)}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>Location:</strong> {sighting.location_name}
                      </p>
                      {sighting.unit && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                          <strong>Unit:</strong> {sighting.unit}
                        </p>
                      )}
                      {sighting.description && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#ccc', maxHeight: '100px', overflow: 'auto' }}>
                          {sighting.description}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Show circle if drawn */}
              {circleCenter && circleRadius && (
                <Circle
                  center={[circleCenter.lat, circleCenter.lng]}
                  radius={circleRadius * 1000}
                  pathOptions={{ color: '#FFFF00', fillColor: '#FFFF00', fillOpacity: 0.2 }}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;

