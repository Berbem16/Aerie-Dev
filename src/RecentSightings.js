import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import './App.css';

// Fix default marker icons for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RecentSightings = () => {
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'map'
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [usingBackendResults, setUsingBackendResults] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [locationRadiusKm, setLocationRadiusKm] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [message, setMessage] = useState('');
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(null);
  const mapRef = useRef(null);
  const drawControlsRef = useRef(null);

  // Get API URL from environment variable or use default
  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  // Function to format datetime for display (YYYY-MM-DDTHH:MM)
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
        setFilteredSightings(data); // Initialize filtered sightings with all data
      }
    } catch (error) {
      console.error('Error fetching sightings:', error);
    }
  }, [API_URL]);

  const runCombinedSearch = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      const st = (startTime || '').trim();
      const et = (endTime || '').trim();
      if (st && et) {
        params.append('start_time', st);
        params.append('end_time', et);
      }
      if ([...params.keys()].length === 0) {
        setUsingBackendResults(false);
        setFilteredSightings(sightings);
        setMessage('Showing all sightings (no backend filters applied).');
        return;
      }
    
      const url = `${API_URL}/sightings/search?` + params.toString();
      const resp = await fetch(url);

      if (!resp.ok) {
        const text = await resp.text();
        setMessage(`Backend search failed ${resp.status}: ${text}`);
        console.error('Backend error payload:', text);
        return;
      }
      const data = await resp.json();
      setFilteredSightings(data);
      setUsingBackendResults(true);
      setMessage(`Showing ${data.length} result(s) from backend time-window search.`);
    } catch (err) {
      console.error(err);
      setMessage('Error running backend search.');
    }
  }, [API_URL, startTime, endTime, sightings]);

  const runAdvancedSearch = useCallback(async () => {
   try {
      // Build search parameters
      const params = new URLSearchParams();
      
      // Time window search
      if (startTime && endTime) {
        params.append('start_time', startTime);
        params.append('end_time', endTime);
      }
      
      // Location search (if provided)
      if (locationText.trim() && locationRadiusKm) {
        params.append('mgrs', locationText);
        params.append('radius_km', String(locationRadiusKm));
      }
      
      // Unit search (if provided)
      const trimmedUnit = unitSearch.trim();
      if (trimmedUnit) {
        params.append('unit', trimmedUnit);
      }

      // If no search parameters, show all sightings
      if ([...params.keys()].length === 0) {
        setUsingBackendResults(false);
        setFilteredSightings(sightings);
        setMessage('Showing all sightings (no backend filters applied).');
        return;
      }

      // Determine which endpoint to use
      let url;
      if (locationText.trim() && locationRadiusKm) {
        // Use MGRS endpoint for location-based search
        url = `${API_URL}/sightings/search/mgrs?` + params.toString();
      } else {
        // Use general search endpoint for time/unit search
        url = `${API_URL}/sightings/search?` + params.toString();
      }
      
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Backend search failed with status ${resp.status}`);
      const data = await resp.json();

      setFilteredSightings(data);
      setUsingBackendResults(true);
      
      // Build success message
      let messageParts = [];
      if (startTime && endTime) messageParts.push('time window');
      if (locationText.trim() && locationRadiusKm) messageParts.push(`location (${locationRadiusKm} km radius)`);
      if (unitSearch.trim()) messageParts.push('unit');
      
      setMessage(`Advanced search: ${data.length} result(s) matching ${messageParts.join(', ')}.`);
    } catch (err) {
      console.error(err);
      setMessage('Error running advanced search.');
    }
  }, [API_URL, startTime, endTime, locationText, locationRadiusKm, unitSearch, sightings]);

  const resetBackendSearch = () => {
    setStartTime('');
    setEndTime('');
    setUsingBackendResults(false);
    setFilteredSightings(sightings);
    setMessage('Reset filters. Showing all sightings.');
    setLocationText('');
    setLocationRadiusKm('');
    setUnitSearch('');
  };

  // Function to filter sightings based on search query
  const filterSightings = useCallback((query) => {
    if (!query.trim()) {
      setFilteredSightings(sightings);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = sightings.filter(sighting => {
      // Search in location name
      const locationMatch = sighting.location_name.toLowerCase().includes(searchTerm);
      
      // Search in coordinates (both lat and lng)
      const latMatch = sighting.latitude.toString().includes(searchTerm);
      const lngMatch = sighting.longitude.toString().includes(searchTerm);
      
      // Search in description
      const descriptionMatch = sighting.description.toLowerCase().includes(searchTerm);
      
      // Search in type of sighting
      const typeMatch = sighting.type_of_sighting.toLowerCase().includes(searchTerm);
      
      // Search in symbol code
      const symbolMatch = sighting.symbol_code ? sighting.symbol_code.toLowerCase().includes(searchTerm) : false;
      
      // Search in ASCC
      const asccMatch = sighting.ascc ? sighting.ascc.toLowerCase().includes(searchTerm) : false;
      
      // Search in unit
      const unitMatch = sighting.unit ? sighting.unit.toLowerCase().includes(searchTerm) : false;
      
      return locationMatch || latMatch || lngMatch || descriptionMatch || typeMatch || symbolMatch || asccMatch || unitMatch;
    });
    
    setFilteredSightings(filtered);
  }, [sightings]);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  // Effect to filter sightings when search query changes
  useEffect(() => {
    filterSightings(searchQuery);
  }, [searchQuery, filterSightings]);

  // Function to handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearLocationSearch = useCallback(() => {
    setLocationText('');
    setLocationRadiusKm('');
    if (startTime && endTime || unitSearch.trim()) {
      runAdvancedSearch();
      setUsingBackendResults(true);
      setMessage('Location filter cleared. Showing other filter results.');
    } else {
      setUsingBackendResults(false);
      setFilteredSightings(sightings);
      setMessage('Location filter cleared. Showing all sightings.');
    }
  }, [startTime, endTime, unitSearch, runAdvancedSearch, sightings]);

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
    const map = useMapEvents({
      ready() {
        if (!map) return;
        
        // Remove existing controls if any
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

        // Handle circle creation
        map.on(L.Draw.Event.CREATED, (e) => {
          const layer = e.layer;
          const center = layer.getLatLng();
          const radius = layer.getRadius(); // in meters
          const radiusKm = radius / 1000; // convert to km

          handleCircleComplete(center.lat, center.lng, radiusKm);
        });

        // Handle circle edit
        map.on(L.Draw.Event.EDITED, (e) => {
          const layers = e.layers;
          layers.eachLayer((layer) => {
            if (layer instanceof L.Circle) {
              const center = layer.getLatLng();
              const radius = layer.getRadius(); // in meters
              const radiusKm = radius / 1000; // convert to km

              handleCircleComplete(center.lat, center.lng, radiusKm);
            }
          });
        });
      }
    });

    return null;
  };

  return (
    <div className="recent-sightings-page">
      <main className="App-main">
        {message && <div className="message">{message}</div>}
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '2px solid #333' }}>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'search' ? '#FFFF00' : '#2d2d2d',
              color: activeTab === 'search' ? '#000' : '#E0E0E0',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'search' ? 'bold' : 'normal',
              borderBottom: activeTab === 'search' ? '2px solid #FFFF00' : '2px solid transparent',
              marginBottom: '-2px'
            }}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'map' ? '#FFFF00' : '#2d2d2d',
              color: activeTab === 'map' ? '#000' : '#E0E0E0',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'map' ? 'bold' : 'normal',
              borderBottom: activeTab === 'map' ? '2px solid #FFFF00' : '2px solid transparent',
              marginBottom: '-2px'
            }}
          >
            Map Search
          </button>
        </div>

        {activeTab === 'search' ? (
          <>
            {/* Advanced (Backend) Search */}
            <section className="advanced-search" style={{marginTop: '1rem', marginBottom: '1.5rem'}}>
              <h3>Advanced Search</h3>
          <div className="advanced-grid" style={{display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'}}>
            <div>
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label>End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label>Location</label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="form-input"
                placeholder="e.g., 18SUJ234678 or 18S UJ 234 678"
              />
            </div>
            <div>
              <label>Location Radius (km)</label>
              <input
                type="number"
                step="any"
                value={locationRadiusKm}
                onChange={(e) => setLocationRadiusKm(e.target.value)}
                className="form-input"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label>Unit</label>
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="form-input"
                placeholder="e.g., 21st TSC or 5th SFG"
              />
            </div>         
          </div>

          <div style={{marginTop: '0.75rem', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <button type="button" className="submit-btn" onClick={runAdvancedSearch}>
              Run Search
            </button>

            <button type="button" className="clear-search-btn" onClick={clearLocationSearch}>
              Clear Location
            </button>

            {usingBackendResults && (
              <button type="button" className="clear-search-btn" onClick={resetBackendSearch}>
                Reset to All
              </button>
            )}
          </div>
        </section>

        <div className="sightings-list">
          <div className="sightings-header">
            <h3>Recent Sightings</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by location, coordinates, type, description, symbol code, ASCC, or unit..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="clear-search-btn">
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {sightings.length === 0 ? (
            <p>No sightings reported yet.</p>
          ) : filteredSightings.length === 0 ? (
            <p>No sightings found matching your search criteria.</p>
          ) : (
            <>
              <div className="search-results-info">
                <small>
                  {usingBackendResults ? 'Backend search: ' : ''}
                  Showing {filteredSightings.length} of {sightings.length} sightings
                  {!usingBackendResults && searchQuery && ` matching "${searchQuery}"`}
                </small>
              </div>
              <div className="sightings-grid">
                {filteredSightings.map((sighting) => (
                  <div key={sighting.id} className="sighting-card">
                    <h4>Type: {sighting.type_of_sighting}</h4>
                    <p><strong>Time:</strong> {formatDateTime(sighting.time)}</p>
                    <p><strong>Location:</strong> {sighting.location_name}</p>
                    <p><strong>Coordinates:</strong> {sighting.latitude}, {sighting.longitude}</p>
                    <p><strong>Description:</strong> {sighting.description}</p>
                    {sighting.symbol_code && (
                      <p><strong>Symbol Code:</strong> {sighting.symbol_code}</p>
                    )}
                    {sighting.ascc && (
                      <p><strong>ASCC:</strong> {sighting.ascc}</p>
                    )}
                    {sighting.unit && (
                      <p><strong>Unit:</strong> {sighting.unit}</p>
                    )}
                    {Array.isArray(sighting.image_urls) && sighting.image_urls.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Pictures:</strong>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {sighting.image_urls.map((url, i) => (
                            <img
                              key={i}
                              src={`${API_URL}${url}`}
                              alt={`sighting-${sighting.id}-${i}`}
                              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }}
                              loading="lazy"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <p><strong>Reported:</strong> {sighting.created_at ? new Date(sighting.created_at).toLocaleString() : '-'}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
          </>
        ) : (
          // Map Search Tab
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '500px', width: '100%' }}>
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
                  />
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
            
            <div className="sightings-list">
              <div className="sightings-header">
                <h3>Search Results</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {circleCenter && (
                    <div style={{ fontSize: '0.875rem', color: '#999' }}>
                      Searching within {circleRadius?.toFixed(2)} km of ({circleCenter.lat.toFixed(4)}, {circleCenter.lng.toFixed(4)})
                    </div>
                  )}
                  {usingBackendResults && (
                    <button 
                      type="button" 
                      className="clear-search-btn" 
                      onClick={() => {
                        setCircleCenter(null);
                        setCircleRadius(null);
                        setUsingBackendResults(false);
                        setFilteredSightings(sightings);
                        setMessage('Map search cleared. Showing all sightings.');
                      }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
              
              {sightings.length === 0 ? (
                <p>No sightings reported yet.</p>
              ) : filteredSightings.length === 0 ? (
                <p>No sightings found within the selected area. Draw a circle on the map to search.</p>
              ) : (
                <>
                  <div className="search-results-info">
                    <small>
                      Showing {filteredSightings.length} of {sightings.length} sightings within search area
                    </small>
                  </div>
                  <div className="sightings-grid">
                    {filteredSightings.map((sighting) => (
                      <div key={sighting.id} className="sighting-card">
                        <h4>Type: {sighting.type_of_sighting}</h4>
                        <p><strong>Time:</strong> {formatDateTime(sighting.time)}</p>
                        <p><strong>Location:</strong> {sighting.location_name}</p>
                        <p><strong>Coordinates:</strong> {sighting.latitude}, {sighting.longitude}</p>
                        <p><strong>Description:</strong> {sighting.description}</p>
                        {sighting.symbol_code && (
                          <p><strong>Symbol Code:</strong> {sighting.symbol_code}</p>
                        )}
                        {sighting.ascc && (
                          <p><strong>ASCC:</strong> {sighting.ascc}</p>
                        )}
                        {sighting.unit && (
                          <p><strong>Unit:</strong> {sighting.unit}</p>
                        )}
                        {Array.isArray(sighting.image_urls) && sighting.image_urls.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Pictures:</strong>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                              {sighting.image_urls.map((url, i) => (
                                <img
                                  key={i}
                                  src={`${API_URL}${url}`}
                                  alt={`sighting-${sighting.id}-${i}`}
                                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <p><strong>Reported:</strong> {sighting.created_at ? new Date(sighting.created_at).toLocaleString() : '-'}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecentSightings;
