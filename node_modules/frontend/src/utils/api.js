// API utility for handling backend calls
const getApiUrl = () => {
  // In production, use the full URL
  if (import.meta.env.PROD) {
    return 'https://sattawala.onrender.com';
  }
  // In development, use direct backend URL to avoid proxy issues
  return 'http://localhost:5000';
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  
  // Always set Content-Type to application/json for POST/PUT/PATCH
  const method = (options.method || 'GET').toUpperCase();
  const isJsonMethod = ['POST', 'PUT', 'PATCH'].includes(method);

  const config = {
    ...options,
    method,
    headers: {
      ...(isJsonMethod ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export default apiCall; 