// API configuration
// In development, uses relative URLs (proxied by React dev server)
// In production, uses the REACT_APP_API_URL environment variable

// Get API URL from environment variable
// If REACT_APP_API_URL is set, use it; otherwise use empty string for relative URLs
const API_URL = process.env.REACT_APP_API_URL || '';

// Log API URL in development (helpful for debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL || 'Using relative URLs (proxy)');
}

export default API_URL;

