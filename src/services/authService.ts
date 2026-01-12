import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    uniqueCode: string;
    role: string;
    avatar?: string;
    status?: string;
  };
  message?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;

    if (token) {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    }

    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;

    if (token) {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    }

    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  },

  async getStoredUser(): Promise<AuthResponse['user'] | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  async getMe(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Failed to get user data from API, using stored data:', error);
      // Fallback to stored user data
      return await this.getStoredUser();
    }
  }
};
