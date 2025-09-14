import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service object
const apiService = {
  // Upload files
  uploadFiles: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      const response = await apiClient.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload files');
    }
  },

  // Search events
  searchEvents: async (searchParams) => {
    try {
      const response = await apiClient.post('/search/', searchParams);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search events');
    }
  },

  // Get uploaded files
  getUploadedFiles: async () => {
    try {
      const response = await apiClient.get('/files/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get uploaded files');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health/');
      return response.data;
    } catch (error) {
      throw new Error('Backend is not available');
    }
  },
};

export default apiService;
