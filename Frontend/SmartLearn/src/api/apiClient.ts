/**
 *  API CLIENT SUMMARY (The "Middleman")
 * * This file is the smart middleman between our React app and the Django server.
 * * 1. AUTOMATIC ID: It grabs our 'accessToken' and attaches it to every request 
 * so the server knows who we are.
 * * 2. THE "LOCK" (isRefreshing): If 10 charts on the dashboard all fail at once 
 * because the token expired, this lock makes sure we only ask the server 
 * for a new token ONCE, not 10 times.
 * * 3. THE "WAITING ROOM" (ProcessQueue): While we are busy getting a new token, 
 * any other incoming requests are put "on hold" in a queue. 
 * * 4. THE "RETRY": Once the new token arrives, this file automatically 
 * retries all those "on hold" requests so the user never sees an error.
 * * 5. EMERGENCY LOGOUT: If the refresh token is also dead, it kicks the user 
 * out to the login page to keep the app secure.
 */

import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1/', 
});


let isRefreshing = false; //to track if refresh request is allready in progress or not 
let failedQueue: any[] = []; // store all requests that failed while we were getting a new Token

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // this waiting request failed : "Refresh failed, Give up"
    } else {
      prom.resolve(token); // for this waiting reques : "is the new token try again"
    }
  });
  failedQueue = []; //Clear the queue
};

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`; // attach a bearer token to each outgoing request
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Agar 401 (Unauthorized) error aaye toh token refresh karein
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If a refresh is already happening, add this request to a queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject }); 
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true; // if status is 401 and not a retry request then mark for retry 
      isRefreshing = true;

      try {
        const refresh = useAuthStore.getState().refreshToken;
        
        // get the refresh token from backend
        const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token/refresh/',{refresh} );        
        const access = response.data.access;

        useAuthStore.setState({ accessToken: access }); // save new token to zustand store
        processQueue(null, access) // release every request in the ProcessQueue
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest); // retry the original request with new token 

      } catch (err) {
        processQueue(err,null) // make each pending request in processQueue fail
        useAuthStore.getState().logout(); //force logout 
        return Promise.reject(err);
      }
      finally{
        isRefreshing = false 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;