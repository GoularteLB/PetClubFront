import axios from 'axios';
import { LoginRequest, AuthResponse } from '../types/auth';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

export const authService = {
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('login', loginData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  getAuthToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return !!this.getAuthToken();
  }
};
