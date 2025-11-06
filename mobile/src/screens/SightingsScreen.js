import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import API_URL from '../config/api';

const SightingsScreen = () => {
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [message, setMessage] = useState('');

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
      Alert.alert('Error', 'Failed to fetch sightings');
    }
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSightings(sightings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sightings.filter((sighting) => {
      return (
        sighting.location_name?.toLowerCase().includes(query) ||
        sighting.type_of_sighting?.toLowerCase().includes(query) ||
        sighting.description?.toLowerCase().includes(query) ||
        sighting.symbol_code?.toLowerCase().includes(query) ||
        sighting.ascc?.toLowerCase().includes(query) ||
        sighting.unit?.toLowerCase().includes(query) ||
        String(sighting.latitude).includes(query) ||
        String(sighting.longitude).includes(query)
      );
    });
    setFilteredSightings(filtered);
  }, [searchQuery, sightings]);

  const runAdvancedSearch = async () => {
    try {
      const params = new URLSearchParams();

      if (startTime && endTime) {
        params.append('start_time', startTime);
        params.append('end_time', endTime);
      }

      if (unitSearch.trim()) {
        params.append('unit', unitSearch.trim());
      }

      if (params.toString() === '') {
        setFilteredSightings(sightings);
        setMessage('Showing all sightings (no filters applied).');
        return;
      }

      const url = `${API_URL}/sightings/search?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        setMessage(`Search failed: ${text}`);
        return;
      }

      const data = await response.json();
      setFilteredSightings(data);
      setMessage(`Found ${data.length} result(s) from backend search.`);
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Error running search.');
      Alert.alert('Error', 'Failed to run search');
    }
  };

  const clearSearch = () => {
    setStartTime('');
    setEndTime('');
    setUnitSearch('');
    setSearchQuery('');
    setFilteredSightings(sightings);
    setMessage('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sightings..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.advancedSearch}>
        <Text style={styles.sectionTitle}>Advanced Search</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time:</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="YYYY-MM-DDTHH:MM"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time:</Text>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="YYYY-MM-DDTHH:MM"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Unit:</Text>
          <TextInput
            style={styles.input}
            value={unitSearch}
            onChangeText={setUnitSearch}
            placeholder="Search by unit name"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.searchButton} onPress={runAdvancedSearch}>
            <Text style={styles.searchButtonText}>Run Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          Showing {filteredSightings.length} of {sightings.length} sightings
        </Text>

        {filteredSightings.map((sighting) => (
          <View key={sighting.id} style={styles.sightingCard}>
            <Text style={styles.sightingTitle}>{sighting.type_of_sighting}</Text>
            <Text style={styles.sightingText}>
              <Text style={styles.sightingLabel}>Time: </Text>
              {formatDateTime(sighting.time)}
            </Text>
            <Text style={styles.sightingText}>
              <Text style={styles.sightingLabel}>Location: </Text>
              {sighting.location_name}
            </Text>
            <Text style={styles.sightingText}>
              <Text style={styles.sightingLabel}>Coordinates: </Text>
              {sighting.latitude}, {sighting.longitude}
            </Text>
            {sighting.unit && (
              <Text style={styles.sightingText}>
                <Text style={styles.sightingLabel}>Unit: </Text>
                {sighting.unit}
              </Text>
            )}
            {sighting.description && (
              <Text style={styles.sightingDescription}>{sighting.description}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  searchInput: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  advancedSearch: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    margin: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#666666',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 4,
    padding: 15,
    margin: 15,
    color: '#ffffff',
    fontSize: 14,
  },
  resultsContainer: {
    padding: 15,
  },
  resultsCount: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 15,
  },
  sightingCard: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sightingTitle: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  sightingText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  sightingLabel: {
    color: '#ffd700',
    fontWeight: '600',
  },
  sightingDescription: {
    color: '#cccccc',
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default SightingsScreen;

