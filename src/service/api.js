import axios from 'axios';

// Configure axios to use the backend server
axios.defaults.baseURL = 'https://solsparrow-backend.onrender.com/api';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Request failed:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default axios;
