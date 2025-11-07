import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import API_URL from '../config/api';

const SightingsScreen = () => {
  const [sightings, setSightings] = useState([]);
  const [recentSightings, setRecentSightings] = useState([]);

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
        // Sort by time (most recent first) and take only 10
        const sorted = data.sort((a, b) => {
          return new Date(b.time) - new Date(a.time);
        });
        setSightings(data);
        setRecentSightings(sorted.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching sightings:', error);
      Alert.alert('Error', 'Failed to fetch sightings');
    }
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Sightings</Text>
        <Text style={styles.headerSubtitle}>
          Showing {recentSightings.length} most recent sightings
        </Text>
      </View>

      <View style={styles.resultsContainer}>
        {recentSightings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sightings found</Text>
          </View>
        ) : (
          recentSightings.map((sighting) => (
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
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  headerTitle: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#cccccc',
    fontSize: 14,
  },
  resultsContainer: {
    padding: 15,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#cccccc',
    fontSize: 16,
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
