// API configuration
// In development, uses relative URLs (proxied by React dev server)
// In production, uses the REACT_APP_API_URL environment variable

const API_URL = process.env.REACT_APP_API_URL || '';

export default API_URL;

