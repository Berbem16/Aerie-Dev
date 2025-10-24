import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import UnitSelectionModal from './UnitSelectionModal';

// Custom component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (event) => {
      onMapClick(event);
    },
  });
  return null;
}

const Home = () => {
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

  const [formData, setFormData] = useState({
    type_of_sighting: '',
    time: getCurrentDateTime(),
    latitude: '',
    longitude: '',
    location_name: '',
    description: '',
    symbol_code: ''
  });
  const [message, setMessage] = useState('');
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 49.4521, lng: 7.5658 }); // Default to Kaiserslautern area
  const [mapZoom] = useState(10);
  const [coordinateSource, setCoordinateSource] = useState(''); // 'map', 'input', or 'manual'
  const [clickedLocation, setClickedLocation] = useState(null); // Store the clicked location for the red pin
  const [locationInputValue, setLocationInputValue] = useState(''); // Store the raw input value
  const [isSearchingLocation, setIsSearchingLocation] = useState(false); // Loading state for location search
  const mapRef = useRef();
  // Pictures feature state
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // URLs returned from backend after upload
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [sightingsCount, setSightingsCount] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Get API URL from environment variable or use default
  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  // Function to fetch sightings count
  const fetchSightingsCount = async () => {
    try {
      const response = await fetch(`${API_URL}/sightings`);
      if (response.ok) {
        const data = await response.json();
        setSightingsCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching sightings count:', error);
    }
  };

  // Function to check if form has pending data
  const checkPendingReports = () => {
    const hasData = formData.type_of_sighting || 
                   formData.latitude || 
                   formData.longitude || 
                   formData.location_name || 
                   formData.description ||
                   photoFiles.length > 0;
    setPendingReports(hasData ? 1 : 0);
  };

  // Fetch sightings count on component mount
  useEffect(() => {
    fetchSightingsCount();
  }, []);

  // Check for pending reports whenever form data changes
  useEffect(() => {
    checkPendingReports();
  }, [formData, photoFiles]);

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

  // --- Pictures feature: input + upload helpers ---
  const onPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
    setUploadError('');
  };

  const clearPhotos = () => {
    photoPreviews.forEach((u) => URL.revokeObjectURL(u));
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setImageUrls([]);
    setUploadError('');
  };

  const uploadImages = async () => {
    if (!photoFiles.length) {
      setImageUrls([]);
      return;
    }
    try {
      setUploadBusy(true);
      setUploadError('');
      const fd = new FormData();
      photoFiles.forEach((f) => fd.append('files', f));
      const res = await fetch(`${API_URL}/upload_images`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed ${res.status}: ${text}`);
      }
      const data = await res.json();
      setImageUrls(data.image_urls || []);
      setMessage(`Uploaded ${data.image_urls?.length || 0} image(s).`);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || String(err));
      setMessage('Error uploading images.');
    } finally {
      setUploadBusy(false);
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
    
    // Auto-populate symbol code based on aircraft type
    if (name === 'type_of_sighting') {
      let symbolCode = '';
      if (value === 'UAS - Fixed Wing') {
        symbolCode = 'SHGPUCVUF-';
      } else if (value === 'UAS - Rotary Wing') {
        symbolCode = 'SHGPUCVUR-';
      } else if (value === 'UAS - Small Commercial' || value === 'UAS - Large Commercial') {
        symbolCode = 'SNGPUCVU--';
      } else if (value === 'Manned - Fixed Wing' || value === 'Manned - Rotary Wing') {
        symbolCode = 'SHGPUCVF--';
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        symbol_code: symbolCode
      }));
    }
    
    // If coordinates are manually entered, mark them as manual
    if (name === 'latitude' || name === 'longitude') {
      setCoordinateSource('manual');
    }
  };

  // Function to set time to current date/time
  const setCurrentTime = () => {
    setFormData(prev => ({
      ...prev,
      time: getCurrentDateTime()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Show unit selection modal instead of directly submitting
    setShowUnitModal(true);
  };

  const handleUnitSelection = async (unitData) => {
    try {
      // Convert datetime-local format to ISO string for backend
      const submissionData = {
        ...formData,
        time: new Date(formData.time).toISOString(),
        image_urls: imageUrls,
        ascc: unitData.ascc,
        unit: unitData.unit,
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
        clearPhotos();
        // Refresh sightings count after successful submission
        fetchSightingsCount();
      } else {
        setMessage('Error submitting sighting');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error submitting sighting');
    }
  };

  const handleCloseModal = () => {
    setShowUnitModal(false);
  };

  const handleSave = () => {
    // Save functionality - could save to localStorage or export data
    setMessage('Save functionality would export current form data.');
  };

  return (
    <div className="home-page">
      <main className="App-main">
        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-title">TOTAL SIGHTINGS</div>
            <div className="card-value">{sightingsCount}</div>
          </div>
          <div className="dashboard-card">
            <div className="card-title">PENDING REPORT</div>
            <div className="card-value">{pendingReports}</div>
          </div>
        </div>

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
            
            {/* Pictures (upload first, then the returned URLs will be sent with the sighting) */}
            <div className="form-group">
              <label>Pictures</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onPhotosChange}
                className="form-input"
              />
              {!!photoPreviews.length && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {photoPreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview-${i}`}
                      style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={uploadImages} className="submit-btn" disabled={uploadBusy}>
                  {uploadBusy ? 'Uploading…' : 'Upload Selected'}
                </button>
                <button type="button" onClick={clearPhotos} className="clear-search-btn" disabled={uploadBusy}>
                  Clear
                </button>
                {!!imageUrls.length && (
                  <small style={{ opacity: 0.85 }}>
                    Ready to attach {imageUrls.length} uploaded image{imageUrls.length > 1 ? 's' : ''}.
                  </small>
                )}
                {uploadError && <small style={{ color: 'crimson' }}>{uploadError}</small>}
              </div>
              <small className="form-help-text">
                Tip: Click <em>Upload Selected</em> first. The returned links will be attached when you submit the sighting.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="symbol_code">Symbol Code:</label>
              <input
                type="text"
                id="symbol_code"
                name="symbol_code"
                value={formData.symbol_code}
                onChange={handleInputChange}
                placeholder="Auto-populated for aircraft types"
                className="form-input"
                readOnly
              />
              <small className="form-help-text">
                Symbol code is automatically populated when aircraft types are selected:
                <br />• UAS - Fixed Wing: SHGPUCVUF-
                <br />• UAS - Rotary Wing: SHGPUCVUR-
                <br />• UAS - Small/Large Commercial: SNGPUCVU--
                <br />• Manned - Fixed/Rotary Wing: SHGPUCVF--
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
                whenCreated={(map) => { mapRef.current = map;}}
              >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {clickedLocation && (
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
      </main>
      
      <UnitSelectionModal
        isOpen={showUnitModal}
        onClose={handleCloseModal}
        onSubmit={handleUnitSelection}
      />
    </div>
  );
};

export default Home;
