// API Configuration
// Update this to match your backend URL
// For development, use your local IP address instead of localhost
// Example: 'http://192.168.1.100:8000'

const API_URL = __DEV__
  ? 'http://localhost:8000' // Change to your local IP for physical device testing
  : 'https://your-production-api.com';

export default API_URL;

