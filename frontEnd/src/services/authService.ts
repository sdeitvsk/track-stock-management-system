
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  role?: 'admin' | 'staff' | 'Officer';
}

interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'Officer';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

class AuthService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.setupInterceptors();
  }

  private setupInterceptors() {
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
      
      this.token = response.data.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, userData);
      
      this.token = response.data.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
        oldPassword,
        newPassword,
      });
      // Optionally update token if returned
      if (response.data?.data?.token) {
        this.token = response.data.data.token;
        localStorage.setItem('token', this.token);
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Password change failed' };
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return this.token;
  }
}

export default new AuthService();
