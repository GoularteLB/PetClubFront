import axios from 'axios';
import { LoginRequest, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:8080';

export const authService = {
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, loginData);
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
