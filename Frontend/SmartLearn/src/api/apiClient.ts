import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // Import your store

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

apiClient.interceptors.request.use((config) => {
  // Access state OUTSIDE of a hook using .getState()
  const token = useAuthStore.getState().token;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = useAuthStore.getState().refreshToken;
        const response = await axios.post('http://localhost:8000/api/v1/auth/token/refresh/', { refresh });
        
        const newAccessToken = response.data.access;

        // UPDATE ZUSTAND DIRECTLY
        useAuthStore.setState({ token: newAccessToken });

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout(); // Log out if refresh fails
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
export default apiClient;