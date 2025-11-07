// API Configuration
// Update this to match your backend URL
// For development, use your local IP address instead of localhost
// Example: 'http://192.168.1.100:8000'

const API_URL = __DEV__
  ? 'http://172.26.21.253:8000' // Your local IP address for device testing
  : 'https://your-production-api.com';

export default API_URL;

