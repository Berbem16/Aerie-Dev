import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import SightingsScreen from './src/screens/SightingsScreen';
import MapScreen from './src/screens/MapScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar component to have full control over labels
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Define labels for each tab - using text only to avoid icon font issues
        let label;
        if (route.name === 'Report') {
          label = 'REPORT';
        } else if (route.name === 'Sightings') {
          label = 'SIGHTINGS';
        } else if (route.name === 'Map') {
          label = 'MAP';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            testID={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <Text 
              style={[
                styles.tabLabel,
                { color: isFocused ? '#ffd700' : '#cccccc' }
              ]}
              numberOfLines={1}
              allowFontScaling={false}
              suppressHighlighting={true}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2d2d2d',
          },
          headerTintColor: '#ffd700',
          headerTitleStyle: {
            fontWeight: '600',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Report"
          component={HomeScreen}
          options={{
            headerTitle: 'AERIE / REPORT',
          }}
        />
        <Tab.Screen
          name="Sightings"
          component={SightingsScreen}
          options={{
            headerTitle: 'AERIE / SIGHTINGS',
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
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
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#2d2d2d',
    borderTopWidth: 1,
    borderTopColor: '#404040',
    paddingVertical: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ffd700',
  },
});

