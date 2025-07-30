import axios from 'axios';

const API_BASE_URL =  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const dbMaintenanceService = {
  async syncProducts() {
    // /purchases/sync-products
    const response = await axios.post(`${API_BASE_URL}/purchases/sync-products`);
    return response.data;
  }

 
};
export interface DatabaseStatus {
  status: 'ok' | 'error';
  message: string;
  last_backup: string | null;
  next_backup: string | null;
}