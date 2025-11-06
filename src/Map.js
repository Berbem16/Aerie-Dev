/* global MoW */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import ms from 'milsymbol';
import { createBasemap, setMapBasemap } from './mowHelpers';
import { initMoW, isMoWAvailable } from './mowLoader';

const Map = () => {
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [usingBackendResults, setUsingBackendResults] = useState(false);
  const [message, setMessage] = useState('');
  const [circleCenter, setCircleCenter] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const featureLayersRef = useRef({});

  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');


  // Function to format datetime for display
  const formatDateTime = useCallback((dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

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

  // Initialize MoW map
  useEffect(() => {
    // Wait for the DOM element to be available
    const mapElement = document.getElementById('mow-map');
    if (!mapElement) {
      console.warn('Map element #mow-map not found in DOM yet');
      return;
    }

    console.log('Initializing MoW map on element:', mapElement);

    initMoW((error) => {
      if (error) {
        console.error('Failed to initialize MoW:', error);
        setMessage('Failed to load map. Please check your network connection and ensure you can access map.nga.mil');
        return;
      }

      if (typeof window.MoW === 'undefined') {
        console.error('MoW is undefined after initMoW callback');
        return;
      }

      console.log('Creating MoW.Map instance...');
      const mapOptions = {
        target: 'mow-map'
      };

      try {
        mapInstanceRef.current = new window.MoW.Map(mapOptions, () => {
        console.log('MoW map loaded');
        
        try {
          // Set a default basemap using predefined ID
          // Available basemap IDs: MoW.Basemap.ID.STREETS, MoW.Basemap.ID.BEST_AVAILABLE, etc.
          if (window.MoW && window.MoW.Basemap && window.MoW.Basemap.ID) {
            // Try to set a streets basemap first
            mapInstanceRef.current.setBasemap(window.MoW.Basemap.ID.STREETS);
            console.log('Set basemap to STREETS');
          } else {
            // Fallback: try common basemap IDs
            try {
              mapInstanceRef.current.setBasemap('streets');
            } catch (e) {
              console.warn('Could not set basemap, trying default:', e);
            }
          }
        } catch (basemapError) {
          console.warn('Error setting basemap:', basemapError);
        }
        
        // Center on default location (Kaiserslautern area)
        try {
          mapInstanceRef.current.setCenter([49.4521, 7.5545], 10);
          console.log('Map centered on default location');
        } catch (centerError) {
          console.error('Error setting map center:', centerError);
        }
        
        // Load sightings after map is ready
        fetchSightings();
        });
      } catch (mapError) {
        console.error('Error creating MoW.Map:', mapError);
        setMessage(`Failed to create map: ${mapError.message}`);
      }
    }, 15000); // 15 second timeout

    return () => {
      // Cleanup if needed
      if (mapInstanceRef.current) {
        // MoW doesn't have explicit destroy, but we can clear features
        Object.values(featureLayersRef.current).forEach(layer => {
          if (layer && mapInstanceRef.current) {
            try {
              mapInstanceRef.current.removeLayer(layer);
            } catch (e) {
              console.error('Error removing layer:', e);
            }
          }
        });
        featureLayersRef.current = {};
      }
    };
  }, [fetchSightings]);

  // Add sightings to map
  useEffect(() => {
    if (!mapInstanceRef.current || filteredSightings.length === 0) return;

    // Clear existing layers
    Object.values(featureLayersRef.current).forEach(layer => {
      if (layer) {
        try {
          mapInstanceRef.current.removeLayer(layer);
        } catch (e) {
          console.error('Error removing layer:', e);
        }
      }
    });
    featureLayersRef.current = {};

    // Create feature overlay for sightings
    const sightingOverlay = {
      id: 'sightings-overlay',
      name: 'UAS Sightings',
      type: 'feature',
      visible: true
    };

    try {
      mapInstanceRef.current.addLayer(sightingOverlay);

      mapInstanceRef.current.layerReady(sightingOverlay, () => {
        // Create features for each sighting
        const features = filteredSightings.map((sighting) => {
          const symbolCode = sighting.symbol_code || '100310000000000000000000000000';
          
          // Create military symbol using milsymbol
          const symbol = new ms.Symbol(symbolCode, {
            size: 50,
            strokeWidth: 2,
            frame: true,
            fill: true
          });

          const svgString = symbol.asSVG();
          
          return {
            id: `sighting-${sighting.id}`,
            geometry: {
              type: 'Point',
              coordinates: [sighting.longitude, sighting.latitude]
            },
            properties: {
              title: sighting.type_of_sighting,
              description: `
                <div style="min-width: 200px;">
                  <h4 style="margin: 0 0 0.5rem 0; color: #FFFF00;">
                    ${sighting.type_of_sighting}
                  </h4>
                  <p style="margin: 0.25rem 0; font-size: 0.875rem;">
                    <strong>Time:</strong> ${formatDateTime(sighting.time)}
                  </p>
                  <p style="margin: 0.25rem 0; font-size: 0.875rem;">
                    <strong>Location:</strong> ${sighting.location_name}
                  </p>
                  ${sighting.unit ? `<p style="margin: 0.25rem 0; font-size: 0.875rem;"><strong>Unit:</strong> ${sighting.unit}</p>` : ''}
                  ${sighting.description ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #ccc; max-height: 100px; overflow: auto;">${sighting.description}</p>` : ''}
                </div>
              `,
              symbolCode: symbolCode,
              icon: svgString
            }
          };
        });

        // Add features to the layer
        mapInstanceRef.current.addFeatures(sightingOverlay, features);
        featureLayersRef.current['sightings-overlay'] = sightingOverlay;

        // Fit map to show all sightings if we have any
        if (features.length > 0) {
          mapInstanceRef.current.layerReady(sightingOverlay, () => {
            try {
              const extent = mapInstanceRef.current.getFeatureLayerExtent(sightingOverlay.id);
              if (extent) {
                mapInstanceRef.current.fitExtent(extent);
              }
            } catch (e) {
              console.error('Error fitting extent:', e);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error adding sightings to map:', error);
    }
  }, [filteredSightings, formatDateTime]);

  // Draw circle functionality
  const drawCircle = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // MoW doesn't have built-in circle drawing, so we'll use a simple click-based approach
    // For now, we'll add a button that allows users to click on map to set center
    // Then prompt for radius
    alert('Circle drawing: Click on the map to set center, then enter radius in km');
    
    // Note: MoW API click events may vary - this is a placeholder
    // You may need to check MoW API documentation for exact event handling
    console.log('Circle drawing mode - check MoW API docs for click event handling');
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

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

        {/* Circle Draw Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button 
            onClick={drawCircle}
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
            Draw Circle Search
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 250px)' }}>
          <div 
            id="mow-map" 
            ref={mapRef}
            style={{ 
              height: '100%', 
              width: '100%', 
              borderRadius: '8px',
              position: 'relative'
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Map;
