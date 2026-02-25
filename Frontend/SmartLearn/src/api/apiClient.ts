import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const apiClient = axios.create({
  // Backend ka Base URL (Django default port 8000)
  baseURL: 'http://127.0.0.1:8000/api/v1/', 
});

apiClient.interceptors.request.use((config) => {
  // Zustand store se token uthayen
  const token = useAuthStore.getState().accessToken; // Check karein aapke store mein 'token' naam hai ya 'accessToken'
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Agar 401 (Unauthorized) error aaye toh token refresh karein
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = useAuthStore.getState().refreshToken;
        
        // Aapka backend path: /users/token/refresh/
        const response = await axios.post('http://127.0.0.1:8000/users/token/refresh/', { 
            refresh: refresh 
        });
        
        const newAccessToken = response.data.access;

        // Zustand store ko naye token ke sath update karein
        useAuthStore.setState({ accessToken: newAccessToken });

        // Original request ko naye token ke sath retry karein
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        // Agar refresh fail ho jaye (e.g. refresh token bhi expire ho gaya)
        useAuthStore.getState().logout(); 
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;