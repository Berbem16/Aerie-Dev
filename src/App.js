import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import './App.css';


// ArcGIS Map Component
function ArcGISMap({ onMapClick, mapCoordinates, clickedLocation, mapRef }) {
  const mapContainerRef = useRef(null);
  const mapViewRef = useRef(null);
  const graphicsLayerRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);

  // Update the ref when onMapClick changes
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Create map with error handling
      const map = new Map({
        basemap: "streets"
      });

    // Handle basemap loading errors
    map.basemap.when(() => {
      console.log("Basemap loaded successfully");
    }).catch((error) => {
      // Only log if it's not an AbortError (which is common and handled gracefully)
      if (error.name !== 'AbortError') {
        console.warn("Basemap loading failed, trying fallback:", error);
      }
      // Fallback to a different basemap
      map.basemap = "osm";
    });

    // Create map view
    const view = new MapView({
      container: mapContainerRef.current,
      map: map,
      center: [mapCoordinates.lng, mapCoordinates.lat], // [longitude, latitude]
      zoom: 10
    });

    // Create graphics layer for markers
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // Store references
    mapViewRef.current = view;
    graphicsLayerRef.current = graphicsLayer;
    if (mapRef) {
      mapRef.current = view;
      // Add layer management functions to the map reference
      mapRef.current.layerManager = {
        findLayerByTitle: (title) => {
          return map.allLayers.find(function(layer) {
            return layer.title === title;
          });
        },
        getNonGroupLayers: () => {
          return map.allLayers.filter(function(layer) {
            return !layer.layers;
          });
        },
        getAllLayers: () => map.allLayers,
        addLayer: (layer) => map.add(layer),
        removeLayer: (layer) => map.remove(layer),
        toggleLayerVisibility: (layer) => {
          layer.visible = !layer.visible;
        }
      };
    }

    // Add click event listener
    const clickHandler = (event) => {
      const point = event.mapPoint;
      onMapClickRef.current({
        latlng: {
          lat: point.latitude,
          lng: point.longitude
        }
      });
    };
    view.on("click", clickHandler);

    // Layer management functionality
    const setupLayerManagement = () => {
      // Create a filtered collection of the non-group layers
      const getNonGroupLayers = () => {
        return map.allLayers.filter(function(layer) {
          return !layer.layers; // layers property indicates it's a group layer
        });
      };

      // Listen for any layer being added or removed in the Map
      if (map && map.allLayers) {
        map.allLayers.on("change", function(event) {
          console.log("Layer added: ", event.added);
          console.log("Layer removed: ", event.removed);
          console.log("Layer moved: ", event.moved);
        });
      }

      // Watching for changes to the visible layers in the Map
      if (reactiveUtils && reactiveUtils.watch) {
        reactiveUtils.watch(
          () => {
            // Add null checks to prevent errors during HMR
            if (!view || !view.map || !view.map.allLayers) {
              return [];
            }
            return view.map.allLayers.filter((layer) => layer.visible);
          },
          (newVisibleLayers, oldVisibleLayers) => {
            // Add null checks for the callback parameters
            if (!newVisibleLayers || !oldVisibleLayers) return;
            
            const added = newVisibleLayers.filter(
              (layer) => !oldVisibleLayers.includes(layer)
            );
            const removed = oldVisibleLayers.filter(
              (layer) => !newVisibleLayers.includes(layer)
            );
            added.forEach((layer) => console.log(layer.title, "is visible"));
            removed.forEach((layer) => console.log(layer.title, "is not visible"));
          }
        );
      } else {
        console.log("reactiveUtils.watch not available, using alternative layer monitoring");
        // Alternative layer monitoring without reactiveUtils
        let previousVisibleLayers = [];
        const checkLayerVisibility = () => {
          // Add null checks to prevent errors during HMR
          if (!view || !view.map || !view.map.allLayers) {
            return;
          }
          
          const currentVisibleLayers = view.map.allLayers.filter((layer) => layer.visible);
          const added = currentVisibleLayers.filter(
            (layer) => !previousVisibleLayers.includes(layer)
          );
          const removed = previousVisibleLayers.filter(
            (layer) => !currentVisibleLayers.includes(layer)
          );
          added.forEach((layer) => console.log(layer.title, "is visible"));
          removed.forEach((layer) => console.log(layer.title, "is not visible"));
          previousVisibleLayers = currentVisibleLayers;
        };
        
        // Check every 2 seconds
        const visibilityInterval = setInterval(checkLayerVisibility, 2000);
        
        // Cleanup interval on component unmount
        return () => {
          if (visibilityInterval) {
            clearInterval(visibilityInterval);
          }
        };
      }

      // Example: Add some sample layers for demonstration
      // You can add your own layers here
      if (map && map.allLayers) {
        console.log("Map initialized with layers:", map.allLayers.length);
        console.log("Non-group layers:", getNonGroupLayers().length);
      }
    };

      // Setup layer management after map is ready
      view.when(() => {
        setupLayerManagement();
      });

      // Cleanup
      return () => {
        if (view) {
          view.destroy();
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update map center when coordinates change
  useEffect(() => {
    if (mapViewRef.current) {
      mapViewRef.current.center = [mapCoordinates.lng, mapCoordinates.lat];
    }
  }, [mapCoordinates.lat, mapCoordinates.lng, mapRef]);

  // Update markers when clicked location changes
  useEffect(() => {
    if (!graphicsLayerRef.current) return;

    // Clear existing graphics
    graphicsLayerRef.current.removeAll();

    // Add new marker if clicked location exists
    if (clickedLocation) {
      const point = new Point({
        longitude: clickedLocation.lng,
        latitude: clickedLocation.lat
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: "red",
        size: "20px",
        outline: {
          color: "white",
          width: 2
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });

      graphicsLayerRef.current.add(graphic);
    }
  }, [clickedLocation]);

  return <div ref={mapContainerRef} style={{ height: '500px', width: '500px' }} />;
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
  const [coordinateSource, setCoordinateSource] = useState(''); // 'map', 'input', or 'manual'
  const [clickedLocation, setClickedLocation] = useState(null); // Store the clicked location for the red pin
  const [locationInputValue, setLocationInputValue] = useState(''); // Store the raw input value
  const [isSearchingLocation, setIsSearchingLocation] = useState(false); // Loading state for location search
  const [searchQuery, setSearchQuery] = useState(''); // Search query for sightings
  const [filteredSightings, setFilteredSightings] = useState([]); // Filtered sightings based on search
  const mapRef = useRef();

  // Get API URL from environment variable or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';


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
              mapRef.current.center = [longitude, latitude];
              mapRef.current.zoom = 15;
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
              mapRef.current.center = [longitude, latitude];
              mapRef.current.zoom = 15;
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
  const handleMapClick = useCallback(async (event) => {
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
  }, []);

  // Function to handle map zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoom = mapRef.current.zoom + 1;
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoom = mapRef.current.zoom - 1;
    }
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

  // Example of using layer management functions
  useEffect(() => {
    if (mapRef.current && mapRef.current.layerManager) {
      // Example: Find a specific layer
      const foundLayer = mapRef.current.layerManager.findLayerByTitle("US Counties");
      if (foundLayer) {
        console.log("Found US Counties layer:", foundLayer);
      }

      // Example: Get all non-group layers
      const nonGroupLayers = mapRef.current.layerManager.getNonGroupLayers();
      console.log("Non-group layers:", nonGroupLayers);

      // Example: Get all layers
      const allLayers = mapRef.current.layerManager.getAllLayers();
      console.log("All layers:", allLayers);
    }
  }, []);

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
              <ArcGISMap 
                onMapClick={handleMapClick}
                mapCoordinates={mapCoordinates}
                clickedLocation={clickedLocation}
                mapRef={mapRef}
              />
            </div>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

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
                  Showing {filteredSightings.length} of {sightings.length} sightings
                  {searchQuery && ` matching "${searchQuery}"`}
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