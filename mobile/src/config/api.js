// API Configuration
// Update this to match your backend URL
// For development, use your local IP address instead of localhost
// Example: 'http://192.168.1.100:8000'
// 
// To find your local IP address:
// Windows: ipconfig (look for IPv4 Address)
// Mac/Linux: ifconfig or ip addr

// IMPORTANT: Make sure your backend is running and accessible from your device
// The device and computer must be on the same network

const API_URL = __DEV__
  ? 'http://localhost:8000' // Update this to your computer's local IP address
  : 'https://your-production-api.com';

export default API_URL;

