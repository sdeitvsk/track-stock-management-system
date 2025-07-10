
import { api } from './api';

export interface IndentRequestItem {
  item_name: string;
  quantity: number;
  remarks?: string;
  approved_quantity?: number; // Optional, used for approved requests
  purchase_id?: number; // Optional, used for linking to existing purchases 
}

export interface CreateIndentRequestPayload {
  department: string;
  purpose: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  items: IndentRequestItem[];
}

export interface IndentRequest {
  id: number;
  member_id: number;
  department: string;
  purpose: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'partial';
  requested_by: string;
  requested_date: string;
  approved_by?: string;
  approved_date?: string;
  remarks?: string;
  items: IndentRequestItem[];
  member?: {
    id: number;
    name: string;
    department: string;
  };
}

export interface IndentRequestFilters {
  status?: string;
  priority?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const indentRequestService = {
  // Create a new indent request
  createIndentRequest: async (data: CreateIndentRequestPayload) => {
    const response = await api.post('/indent-requests', data);
    return response.data;
  },

  // Get all indent requests with filtering
  getIndentRequests: async (filters?: IndentRequestFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/indent-requests?${params.toString()}`);
    return response.data;
  },

  // Get specific indent request by ID
  getIndentRequestById: async (id: number) => {
    const response = await api.get(`/indent-requests/${id}`);
    return response.data;
  },

  // Update indent request status
  updateIndentRequestStatus: async (id: number, data: {
    status: 'approved' | 'rejected' | 'partial';
    remarks?: string;
    approved_quantities?: Array<{ item_id: number; approved_quantity: number }>;
  }) => {
    const response = await api.patch(`/indent-requests/${id}/status`, data);
    return response.data;
  },

  // Delete indent request
  deleteIndentRequest: async (id: number) => {
    const response = await api.delete(`/indent-requests/${id}`);
    return response.data;
  }
};
