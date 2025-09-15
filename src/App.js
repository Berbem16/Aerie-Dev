import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import * as mgrs from 'mgrs';


// Custom component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (event) => {
      onMapClick(event);
    },
  });
  return null;
}

function App() {
  // Function to get current date and time in the correct format for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:MM
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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

  const [formData, setFormData] = useState({
    type_of_sighting: '',
    time: getCurrentDateTime(),
    latitude: '',
    longitude: '',
    location_name: '',
    description: '',
    symbol_code: ''
  });
  const [sightings, setSightings] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 49.4521, lng: 7.5658 }); // Default to Kaiserslautern area
  const [mapZoom] = useState(10);
  const [coordinateSource, setCoordinateSource] = useState(''); // 'map', 'input', or 'manual'
  const [clickedLocation, setClickedLocation] = useState(null); // Store the clicked location for the red pin
  const [locationInputValue, setLocationInputValue] = useState(''); // Store the raw input value
  const [isSearchingLocation, setIsSearchingLocation] = useState(false); // Loading state for location search
  const [searchQuery, setSearchQuery] = useState(''); // Search query for sightings
  const [filteredSightings, setFilteredSightings] = useState([]); // Filtered sightings based on search
  const mapRef = useRef();
  // Advanced (backend) search state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [usingBackendResults, setUsingBackendResults] = useState(false);
  // MGRS search UI + circle state
  const [mgrsText, setMgrsText] = useState('');
  const [mgrsRadiusKm, setMgrsRadiusKm] = useState('');
  const [circleCenter, setCircleCenter] = useState(null); // { lat, lng }
  const [circleRadiusM, setCircleRadiusM] = useState(0); // in meters

  // Get API URL from environment variable or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ----- MGRS circle helpers & derived list -----
  const toRad = (d) => (d * Math.PI) / 180;
  const distanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  const mgrsActive = !!circleCenter && circleRadiusM > 0;

  const sightingsInCircle = React.useMemo(() => {
    if (!mgrsActive) return [];
    const rKm = circleRadiusM / 1000;
    return filteredSightings.filter((s) => {
      if (s.latitude == null || s.longitude == null) return false;
      return (
        distanceKm(
          circleCenter.lat,
          circleCenter.lng,
          Number(s.latitude),
          Number(s.longitude)
        ) <= rKm
      );
    });
  }, [mgrsActive, circleCenter, circleRadiusM, filteredSightings]);

  // Type of sighting options for the dropdown
  const sightingTypeOptions = [
    'UAS - Fixed Wing',
    'UAS - Rotary Wing',
    'UAS - Small Commercial',
    'UAS - Large Commercial',
    'Manned - Fixed Wing',
    'Manned - Rotary Wing'
  ];

  // Function to get coordinates from OSRM API
  const getCoordinatesFromOSRM = async (locationName) => {
    console.log('getCoordinatesFromOSRM called with:', locationName);
    setIsLoadingCoordinates(true);
    setIsSearchingLocation(true);
    try {
      // Convert location name to searchable format
      const searchQuery = encodeURIComponent(locationName);
      console.log('Search query:', searchQuery);
      
      // Try Nominatim geocoding API first (more reliable for general locations)
      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&addressdetails=1`
        );
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          console.log('Nominatim API Response:', nominatimData);
          
          if (nominatimData && nominatimData.length > 0) {
            const location = nominatimData[0];
            const latitude = parseFloat(location.lat);
            const longitude = parseFloat(location.lon);
            
            // Get the formatted location name from the API response
            const apiLocationName = location.display_name || locationName;
            
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
              location_name: apiLocationName
            }));
            
            // Update the input value to show what the API returned
            setLocationInputValue(apiLocationName);
            
            // Center the map on the found location and drop a pin
            setMapCoordinates({ lat: latitude, lng: longitude });
            setClickedLocation({ lat: latitude, lng: longitude });
            
            // Zoom in on the location for better view
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 15);
            }
            
            setCoordinateSource('input');
            setMessage(`Coordinates found via Nominatim API for ${apiLocationName}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            return;
          }
        }
      } catch (nominatimError) {
        console.log('Nominatim API failed, trying OSRM geocoding service');
      }
      
      // Try OSRM geocoding API as fallback
      try {
        const response = await fetch(
          `https://router.project-osrm.org/geocode/v1/driving/${searchQuery}?limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('OSRM API Response:', data);
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const coordinates = feature.geometry.coordinates;
            // OSRM returns [longitude, latitude] so we need to swap them
            const [longitude, latitude] = coordinates;
            
            // Get the formatted location name from the API response
            const apiLocationName = feature.properties?.name || 
                                  feature.properties?.label || 
                                  locationName;
            
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
              location_name: apiLocationName
            }));
            
            // Update the input value to show what the API returned
            setLocationInputValue(apiLocationName);
            
            // Center the map on the found location and drop a pin
            setMapCoordinates({ lat: latitude, lng: longitude });
            setClickedLocation({ lat: latitude, lng: longitude });
            
            // Zoom in on the location for better view
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 15);
            }
            
            setCoordinateSource('input');
            setMessage(`Coordinates found via OSRM API for ${apiLocationName}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            return;
          }
        }
      } catch (osrmError) {
        console.log('OSRM API failed, trying hardcoded coordinates');
      }
      
      
      // Fallback to hardcoded coordinates
      const fallbackCoords = getHardcodedCoordinates(locationName);
      if (fallbackCoords) {
        setFormData(prev => ({
          ...prev,
          latitude: fallbackCoords.lat.toFixed(6),
          longitude: fallbackCoords.lng.toFixed(6),
          location_name: locationName
        }));
        
        // Update the input value to show what was used
        setLocationInputValue(locationName);
        
        // Center the map on the found location and drop a pin
        setMapCoordinates({ lat: fallbackCoords.lat, lng: fallbackCoords.lng });
        setClickedLocation({ lat: fallbackCoords.lat, lng: fallbackCoords.lng });
        
        // Zoom in on the location for better view
        if (mapRef.current) {
          mapRef.current.setView([fallbackCoords.lat, fallbackCoords.lng], 15);
        }
        
        setCoordinateSource('input');
        setMessage(`Using fallback coordinates for ${locationName}: ${fallbackCoords.lat.toFixed(6)}, ${fallbackCoords.lng.toFixed(6)}`);
      } else {
        setMessage(`No coordinates found for ${locationName}. Please enter coordinates manually.`);
      }
      
    } catch (error) {
      console.error('Error in coordinate fetching:', error);
      // Final fallback to hardcoded coordinates
      const fallbackCoords = getHardcodedCoordinates(locationName);
      if (fallbackCoords) {
        setFormData(prev => ({
          ...prev,
          latitude: fallbackCoords.lat.toFixed(6),
          longitude: fallbackCoords.lng.toFixed(6),
          location_name: locationName
        }));
        
        // Update the input value to show what was used
        setLocationInputValue(locationName);
        
        // Center the map on the found location and drop a pin
        setMapCoordinates({ lat: fallbackCoords.lat, lng: fallbackCoords.lng });
        setClickedLocation({ lat: fallbackCoords.lat, lng: fallbackCoords.lng });
        
        // Zoom in on the location for better view
        if (mapRef.current) {
          mapRef.current.setView([fallbackCoords.lat, fallbackCoords.lng], 15);
        }
        
        setCoordinateSource('input');
        setMessage(`Using fallback coordinates for ${locationName}: ${fallbackCoords.lat.toFixed(6)}, ${fallbackCoords.lng.toFixed(6)}`);
      } else {
        setMessage(`Error fetching coordinates for ${locationName}. Please enter coordinates manually.`);
      }
    } finally {
      setIsLoadingCoordinates(false);
      setIsSearchingLocation(false);
    }
  };

  // Hardcoded coordinates for known military locations in Germany (fallback)
  const getHardcodedCoordinates = (locationName) => {
    const coordinates = {
      'Panzer Kaserne, Böblingen, Germany': { lat: 48.6833, lng: 9.0167 },
      'Rhine Ordnance Barracks, Kaiserslautern, Germany': { lat: 49.4521, lng: 7.5658 },
      'Ramstein Air Base, Germany': { lat: 49.4369, lng: 7.6000 },
      'Landstuhl Regional Medical Center, Germany': { lat: 49.4167, lng: 7.5667 },
      'Kleber Kaserne, Kaiserslautern, Germany': { lat: 49.4521, lng: 7.5658 },
      'Daenner Kaserne, Kaiserslautern, Germany': { lat: 49.4521, lng: 7.5658 },
      'Vogelweh Housing, Kaiserslautern, Germany': { lat: 49.4521, lng: 7.5658 },
      'Sembach Kaserne, Sembach, Germany': { lat: 49.5167, lng: 7.8500 }
    };
    
    return coordinates[locationName] || null;
  };

  // Function to reverse geocode coordinates to get location name
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          return data.display_name;
        }
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
    }
    return null;
  };

  // Function to handle map clicks and update coordinates
  const handleMapClick = async (event) => {
    console.log('Map clicked!', event.latlng);
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;
    
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
    
    // Update the map center to show where user clicked
    setMapCoordinates({ lat, lng });
    setCoordinateSource('map');
    
    // Set the clicked location for the red pin
    setClickedLocation({ lat, lng });
    
    // Try to get location name from coordinates
    const locationName = await reverseGeocode(lat, lng);
    if (locationName) {
      setFormData(prev => ({
        ...prev,
        location_name: locationName
      }));
      setLocationInputValue(locationName);
      setMessage(`Map coordinates selected: ${lat.toFixed(6)}, ${lng.toFixed(6)} - Location: ${locationName}`);
    } else {
      setMessage(`Map coordinates selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // Function to handle map zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  // Function to handle when map is loaded
  const handleMapLoad = (map) => {
    mapRef.current = map;
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

  const runMgrsSearch = useCallback(async () => {
   try {
      if (!mgrsText.trim() || !mgrsRadiusKm) {
        setMessage('Enter an MGRS string and a radius (km).');
        return;
      }

     // For map/circle preview: convert MGRS -> [lon, lat]
      let lat, lng;
      try {
        const [lon, latDeg] = mgrs.toPoint(mgrsText.replace(/\s+/g, ''));
        lat = latDeg;
        lng = lon;
      } catch (e) {
        setMessage('Invalid MGRS coordinate.');
        return;
      }

      // Draw/update circle on the map
      setCircleCenter({ lat, lng });
      setCircleRadiusM(Number(mgrsRadiusKm) * 1000);
      if (mapRef.current) {
        // Zoom heuristic based on radius
        const r = Number(mgrsRadiusKm);
        const z = r > 50 ? 8 : r > 10 ? 10 : 12;
        mapRef.current.setView([lat, lng], z);
      }

      // Call backend
      const params = new URLSearchParams({
        mgrs: mgrsText,
        radius_km: String(mgrsRadiusKm),
      });
     // Optional: include time window if you filled them
      if (startTime) params.append('start_time', startTime);
      if (endTime)   params.append('end_time', endTime);

      const url = `${API_URL}/sightings/search/mgrs?` + params.toString();
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Backend MGRS search failed with status ${resp.status}`);
      const data = await resp.json();

      setFilteredSightings(data);
      setUsingBackendResults(true);
      setMessage(`MGRS search: ${data.length} result(s) within ${mgrsRadiusKm} km of ${mgrsText}.`);
    } catch (err) {
      console.error(err);
      setMessage('Error running MGRS search.');
    }
  }, [API_URL, mgrsText, mgrsRadiusKm, startTime, endTime]);

  const resetBackendSearch = () => {
    setStartTime('');
    setEndTime('');
    setUsingBackendResults(false);
    setFilteredSightings(sightings);
    setMessage('Reset filters. Showing all sightings.');
    setMgrsText('');
    setMgrsRadiusKm('');
    setCircleCenter(null);
    setCircleRadiusM(0);
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
      
      return locationMatch || latMatch || lngMatch || descriptionMatch || typeMatch || symbolMatch;
    });
    
    setFilteredSightings(filtered);
  }, [sightings]);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  // Function to handle location search button click
  const handleLocationSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Search button clicked, locationInputValue:', locationInputValue);
    if (locationInputValue.trim()) {
      console.log('Calling getCoordinatesFromOSRM with:', locationInputValue.trim());
      getCoordinatesFromOSRM(locationInputValue.trim());
    } else {
      setMessage("Please enter a location to search for coordinates.");
    }
  };

  // Function to handle Enter key in location input
  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLocationSearch(e);
    }
  };

  // Effect to filter sightings when search query changes
  useEffect(() => {
    filterSightings(searchQuery);
  }, [searchQuery, filterSightings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'location_name') {
      // Handle location input - only update the input value, don't trigger API call
      setLocationInputValue(value);
    } else {
      // Handle other form inputs normally
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Auto-populate symbol code when UAS - Fixed Wing is selected
    if (name === 'type_of_sighting' && value === 'UAS - Fixed Wing') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        symbol_code: 'SHAPMF--***'
      }));
    } else if (name === 'type_of_sighting' && value !== 'UAS - Fixed Wing') {
      // Clear symbol code if not UAS - Fixed Wing
      setFormData(prev => ({
        ...prev,
        [name]: value,
        symbol_code: ''
      }));
    }
    
    // If coordinates are manually entered, mark them as manual
    if (name === 'latitude' || name === 'longitude') {
      setCoordinateSource('manual');
    }
  };

  // Function to handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Function to set time to current date/time
  const setCurrentTime = () => {
    setFormData(prev => ({
      ...prev,
      time: getCurrentDateTime()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert datetime-local format to ISO string for backend
      const submissionData = {
        ...formData,
        time: new Date(formData.time).toISOString()
      };
      
      const response = await fetch(`${API_URL}/sightings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (response.ok) {
        setMessage('Sighting submitted successfully!');
        setFormData({
          type_of_sighting: '',
          time: getCurrentDateTime(),
          latitude: '',
          longitude: '',
          location_name: '',
          description: '',
          symbol_code: ''
        });
        setLocationInputValue('');
        fetchSightings();
      } else {
        setMessage('Error submitting sighting');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error submitting sighting');
    }
  };

  const handleSave = () => {
    // Save functionality - could save to localStorage or export data
    const dataStr = JSON.stringify(sightings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'uas_sightings.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Data saved successfully!');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="main-title">AERIE</h1>
        <h2 className="subtitle">Aerial Event Reporting & Intelligence Exchange</h2>
      </header>
      
      <main className="App-main">
        <div className="form-and-map-container">
          <form onSubmit={handleSubmit} className="reporting-form">
            <div className="form-group">
              <label htmlFor="type_of_sighting">Type of Sighting:</label>
              <select
                id="type_of_sighting"
                name="type_of_sighting"
                value={formData.type_of_sighting}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select a type</option>
                {sightingTypeOptions.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time">Time:</label>
              <div className="time-input-container">
                <input
                  type="datetime-local"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="form-input time-input"
                />
                <button
                  type="button"
                  onClick={setCurrentTime}
                  className="current-time-btn"
                  title="Set to current date and time"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location_name">Location:</label>
              <div className="location-search-container">
                <input
                  type="text"
                  id="location_name"
                  name="location_name"
                  value={locationInputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleLocationKeyPress}
                  placeholder={isSearchingLocation ? "Searching..." : "Enter location (e.g., Pittsburgh, PA)"}
                  className="form-input location-input"
                  disabled={isSearchingLocation}
                  required
                />
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  disabled={isSearchingLocation}
                  className="location-search-btn"
                >
                  {isSearchingLocation ? "Searching..." : "Search"}
                </button>
              </div>
              {isSearchingLocation && (
                <div className="loading-indicator">
                  <small>Searching for location...</small>
                </div>
              )}
            </div>

            <div className="coordinates-group">
              <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="any"
                  placeholder={isLoadingCoordinates ? "Loading..." : "e.g., 49.4521"}
                  required
                  className="form-input"
                  readOnly={isLoadingCoordinates}
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude:</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="any"
                  placeholder={isLoadingCoordinates ? "Loading..." : "e.g., 7.5658"}
                  required
                  className="form-input"
                  readOnly={isLoadingCoordinates}
                />
              </div>
              {isLoadingCoordinates && (
                <div className="loading-indicator">
                  <small>Fetching coordinates from OSRM API...</small>
                </div>
              )}
              <div className="coordinates-info">
                <small>
                  {formData.latitude && formData.longitude ? (
                    <>
                      <strong>Coordinates: {formData.latitude}, {formData.longitude}</strong>
                      {coordinateSource && (
                        <span style={{ marginLeft: '10px', opacity: 0.8 }}>
                          (Source: {coordinateSource === 'map' ? 'Map Click' : 
                                   coordinateSource === 'input' ? 'Location Input' : 
                                   coordinateSource === 'manual' ? 'Manual Entry' : 'Unknown'})
                        </span>
                      )}
                    </>
                  ) : (
                    'Coordinates are automatically populated when you type a location or click on the map. You can edit them manually if needed.'
                  )}
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="symbol_code">Symbol Code:</label>
              <input
                type="text"
                id="symbol_code"
                name="symbol_code"
                value={formData.symbol_code}
                onChange={handleInputChange}
                placeholder="Auto-populated for UAS - Fixed Wing"
                className="form-input"
                readOnly
              />
              <small className="form-help-text">
                Symbol code is automatically populated when "UAS - Fixed Wing" is selected
              </small>
            </div>

            <div className="button-group">
              <button type="submit" className="submit-btn">Submit</button>
              <button type="button" onClick={handleSave} className="save-btn">Save</button>
            </div>
          </form>

          <div className="map-container">
            <div className="map-header">
              <h3>Interactive Map</h3>
              <div className="map-controls">
                <button onClick={handleZoomIn} className="map-btn">+</button>
                <button onClick={handleZoomOut} className="map-btn">-</button>
              </div>
            </div>
            <div className="map-instructions">
              <small>Click anywhere on the map to get coordinates</small>
            </div>
            <div className="map-tile">
              <MapContainer
                center={mapCoordinates}
                zoom={mapZoom}
                style={{ height: '500px', width: '500px' }}
                ref={mapRef}
                onLoad={handleMapLoad}
              >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {circleCenter && circleRadiusM > 0 && (
                <Circle
                  center={circleCenter}
                  radius={circleRadiusM}
                  pathOptions={{ color: '#dbc502e0', weight: 2, fillOpacity: 0.05}}
                  />
              )}

              {mgrsActive &&
                sightingsInCircle.map((s) => (
                  <CircleMarker
                    key={`sighting-${s.id}`}
                    center={[Number(s.latitude), Number(s.longitude)]}
                    radius={6}
                    pathOptions={{ color: '#4a4a06ff', weight: 2, fillOpacity: 0.6 }}
                  >
                    <Popup>
                      <div><strong>{s.type_of_sighting}</strong></div>
                      <div>{s.location_name}</div>
                      <div>{formatDateTime(s.time)}</div>
                      <div>
                        {Number(s.latitude).toFixed(5)}, {Number(s.longitude).toFixed(5)}
                      </div>
                      {s.symbol_code && <div>Symbol: {s.symbol_code}</div>}
                    </Popup>
                  </CircleMarker>
                ))}
              {clickedLocation && !mgrsActive && (
                <Marker 
                  position={clickedLocation}
                  icon={L.divIcon({
                    className: 'red-pin-marker',
                    html: '<div style="font-size: 24px; color: red; text-align: center; line-height: 1;">📍</div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                  })}
                />
              )}
              <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>
            </div>
          </div>
        </div>

        {message && <div className="message">{message}</div>}
        
        {/* Advanced (Backend) Search */}
        <section className="advanced-search" style={{marginTop: '1rem', marginBottom: '1.5rem'}}>
          <h3>Advanced Search (Backend)</h3>
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
              <label>MGRS</label>
              <input
                type="text"
                value={mgrsText}
                onChange={(e) => setMgrsText(e.target.value)}
                className="form-input"
                placeholder="e.g., 18SUJ234678 or 18S UJ 234 678"
              />
            </div>
            <div>
              <label>MGRS Radius (km)</label>
              <input
                type="number"
                step="any"
                value={mgrsRadiusKm}
                onChange={(e) => setMgrsRadiusKm(e.target.value)}
                className="form-input"
                placeholder="e.g., 5"
              />
            </div>         
          </div>

          <div style={{marginTop: '0.75rem', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <button type="button" className="submit-btn" onClick={runCombinedSearch}>
              Run Backend Search
            </button>
            <button type="button" className="submit-btn" onClick={runMgrsSearch}>
              Run MGRS Search
            </button>
            {usingBackendResults && (
              <button type="button" className="clear-search-btn" onClick={resetBackendSearch}>
                Reset to All
              </button>
            )}
          </div>

          <small style={{opacity: 0.8}}>
            Tip: you can fill coordinates by clicking on the map or by the location search above, then click “Use Current Map/Field Coords”.
          </small>
        </section>

        <div className="sightings-list">
          <div className="sightings-header">
            <h3>Recent Sightings</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by location, coordinates, type, description, or symbol code..."
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
                    <p><strong>Reported:</strong> {new Date(sighting.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 