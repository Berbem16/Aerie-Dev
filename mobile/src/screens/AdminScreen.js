import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const AdminScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>
          Admin features coming soon to mobile app
        </Text>
        <Text style={styles.description}>
          The admin panel functionality will be available in a future update.
          For now, please use the web interface for administrative tasks.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  description: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminScreen;

