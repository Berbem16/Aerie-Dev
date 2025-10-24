import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const RecentSightings = () => {
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
      if (unitSearch.trim()) {
        params.append('unit', unitSearch.trim());
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

  return (
    <div className="recent-sightings-page">
      <main className="App-main">
        {message && <div className="message">{message}</div>}
        
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
      </main>
    </div>
  );
};

export default RecentSightings;
