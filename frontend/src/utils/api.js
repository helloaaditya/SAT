// API utility for handling backend calls
const getApiUrl = () => {
  // In production, use the full URL
  if (import.meta.env.PROD) {
    return 'https://sattawala.onrender.com';
  }
  // In development, use relative path (will be proxied by Vite)
  return '';
};

export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default apiCall; 