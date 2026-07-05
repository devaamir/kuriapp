import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';
import { store, clearUser } from '../store';

// const BASE_URL = Platform.select({
//   android: 'http://10.0.2.2:3001/api/v1',
//   ios: 'http://localhost:3001/api/v1',
//   default: 'http://localhost:3001/api/v1',
// });

// const BASE_URL = 'https://kuriapp-backend-admin.onrender.com/api/v1'
const BASE_URL = 'http://192.168.2.1:3002/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          store.dispatch(clearUser());
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken },
        );
        const { token } = refreshResponse.data;

        await AsyncStorage.setItem('authToken', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        store.dispatch(clearUser());
      }
    }

    return Promise.reject(error);
  },
);

export default api;
