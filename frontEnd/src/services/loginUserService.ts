
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface LoginUser {
  id: number;
  username: string;
  member_id: number | null;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  member?: {
    id: number;
    name: string;
    type: string;
    department: string | null;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    users: T[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_records: number;
      limit: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const loginUserService = {
  async getLoginUsers(filters: any = {}): Promise<PaginatedResponse<LoginUser>> {
    const response = await axios.get(`${API_BASE_URL}/login-users`, { params: filters });
    return response.data;
  },

  async createLoginUser(userData: {
    username: string;
    password: string;
    member_id?: number;
    role?: 'admin' | 'staff';
  }): Promise<ApiResponse<{ user: LoginUser }>> {
    const response = await axios.post(`${API_BASE_URL}/login-users`, userData);
    return response.data;
  },

  async updateLoginUser(id: number, userData: {
    username?: string;
    member_id?: number;
    role?: 'admin' | 'staff';
    is_active?: boolean;
  }): Promise<ApiResponse<{ user: LoginUser }>> {
    const response = await axios.put(`${API_BASE_URL}/login-users/${id}`, userData);
    return response.data;
  },

  async resetPassword(id: number, newPassword: string): Promise<ApiResponse<void>> {
    const response = await axios.post(`${API_BASE_URL}/login-users/${id}/reset-password`, {
      new_password: newPassword
    });
    return response.data;
  },

  async deleteLoginUser(id: number): Promise<ApiResponse<void>> {
    const response = await axios.delete(`${API_BASE_URL}/login-users/${id}`);
    return response.data;
  }
};
