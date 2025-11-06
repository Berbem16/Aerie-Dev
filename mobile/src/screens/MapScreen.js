import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import API_URL from '../config/api';
import ms from 'milsymbol';

const MapScreen = () => {
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [region, setRegion] = useState({
    latitude: 49.4521,
    longitude: 7.5658,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [circleSearch, setCircleSearch] = useState(null);
  const [usingBackendResults, setUsingBackendResults] = useState(false);

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
      Alert.alert('Error', 'Failed to fetch sightings');
    }
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  const searchByCircle = async (centerLat, centerLon, radiusKm) => {
    try {
      const params = new URLSearchParams();
      params.append('latitude', centerLat.toString());
      params.append('longitude', centerLon.toString());
      params.append('radius_km', radiusKm.toString());

      const url = `${API_URL}/sightings/search?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setFilteredSightings(data);
      setUsingBackendResults(true);
      Alert.alert('Search Results', `Found ${data.length} sighting(s) within ${radiusKm} km radius.`);
    } catch (error) {
      console.error('Error searching by circle:', error);
      Alert.alert('Error', 'Failed to search by circle');
    }
  };

  const handleMapLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    Alert.prompt(
      'Circle Search',
      'Enter radius in kilometers:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Search',
          onPress: (radius) => {
            const radiusKm = parseFloat(radius);
            if (!isNaN(radiusKm) && radiusKm > 0) {
              setCircleSearch({
                center: { latitude, longitude },
                radius: radiusKm * 1000, // Convert to meters
              });
              searchByCircle(latitude, longitude, radiusKm);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const clearSearch = () => {
    setCircleSearch(null);
    setUsingBackendResults(false);
    setFilteredSightings(sightings);
  };

  const getSymbolIcon = (symbolCode) => {
    try {
      const symbol = new ms.Symbol(symbolCode || '100310000000000000000000000000', {
        size: 50,
        strokeWidth: 2,
        frame: true,
        fill: true,
      });
      // Note: react-native-maps doesn't support SVG directly
      // You may need to convert to image or use a different approach
      return null;
    } catch (error) {
      console.error('Error creating symbol:', error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onLongPress={handleMapLongPress}
      >
        {filteredSightings.map((sighting) => (
          <Marker
            key={sighting.id}
            coordinate={{
              latitude: sighting.latitude,
              longitude: sighting.longitude,
            }}
            title={sighting.type_of_sighting}
            description={`${formatDateTime(sighting.time)}\n${sighting.location_name}`}
          />
        ))}

        {circleSearch && (
          <Circle
            center={circleSearch.center}
            radius={circleSearch.radius}
            strokeColor="#ffd700"
            fillColor="rgba(255, 215, 0, 0.2)"
            strokeWidth={2}
          />
        )}
      </MapView>

      <View style={styles.controls}>
        {circleSearch && usingBackendResults && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.instruction}>
          Long press on map to search by circle
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end',
  },
  clearButton: {
    backgroundColor: '#ffd700',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  clearButtonText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '600',
  },
  instruction: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
    fontSize: 12,
  },
});

export default MapScreen;

