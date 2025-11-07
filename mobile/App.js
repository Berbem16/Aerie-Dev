import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './src/screens/HomeScreen';
import SightingsScreen from './src/screens/SightingsScreen';
import MapScreen from './src/screens/MapScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2d2d2d',
          },
          headerTintColor: '#ffd700',
          headerTitleStyle: {
            fontWeight: '600',
            letterSpacing: 0.5,
          },
          tabBarStyle: {
            backgroundColor: '#2d2d2d',
            borderTopColor: '#404040',
          },
          tabBarActiveTintColor: '#ffd700',
          tabBarInactiveTintColor: '#cccccc',
        }}
      >
        <Tab.Screen
          name="Report"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="add-circle" size={size} color={color} />
            ),
            headerTitle: 'AERIE / REPORT',
          }}
        />
        <Tab.Screen
          name="Sightings"
          component={SightingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="visibility" size={size} color={color} />
            ),
            headerTitle: 'AERIE / SIGHTINGS',
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="map" size={size} color={color} />
            ),
            headerTitle: 'AERIE / MAP',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});

