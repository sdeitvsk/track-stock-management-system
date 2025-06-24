import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface Member {
  id: number;
  name: string;
  type: 'employee' | 'supplier' | 'station';
  category: string | null;
  department: string | null;
  contact_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  type: 'purchase' | 'issue';
  member_id: number;
  invoice_no: string | null;
  invoice_date: string | null;
  transaction_date: string;
  description: string | null;
  member: Member;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  transaction_id: number;
  item_name: string;
  quantity: number;
  rate: string; // API returns rate as string
  remaining_quantity: number;
  purchase_date: string;
  transaction: Transaction;
}

export interface Issue {
  id: number;
  transaction_id: number;
  member_id: number;
  purchase_id: number;
  item_name: string;
  quantity: number;
  issue_date: string;
  transaction: Transaction;
  purchase: Purchase;
  member: Member;
}

export interface InventoryItem {
  item_name: string;
  total_purchased: number;
  current_stock: number;
  total_issued: number;
  average_rate: number;
  total_value: number;
  current_value: number;
  first_purchase_date: string;
  last_purchase_date: string;
  purchase_batches: number;
}

export interface LowStockAlert {
  item_name: string;
  current_stock: number;
  stock_percentage: number;
}

export interface InventorySummary {
  inventory_summary: InventoryItem[];
  low_stock_alerts: LowStockAlert[];
  summary_stats: {
    total_items: number;
    low_stock_items: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    purchases?: T[]; // For purchases endpoint
    members?: T[]; // For members endpoint
    issues?: T[]; // For issues endpoint
    transactions?: T[]; // For transactions endpoint
    rows?: T[]; // Generic for other paginated responses
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
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export const inventoryService = {
  // Inventory Summary
  async getInventorySummary(itemName = ''): Promise<ApiResponse<InventorySummary>> {
    const params = itemName ? { item_name: itemName } : {};
    const response = await axios.get(`${API_BASE_URL}/inventory/summary`, { params });
    return response.data;
  },

  // Members
  async getMembers(filters: any = {}): Promise<PaginatedResponse<Member>> {
    const response = await axios.get(`${API_BASE_URL}/members`, { params: filters });
    return response.data;
  },

  async createMember(memberData: Omit<Member, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<ApiResponse<Member>> {
    const response = await axios.post(`${API_BASE_URL}/members`, memberData);
    return response.data;
  },

  async updateMember(id: number, memberData: Partial<Member>): Promise<ApiResponse<Member>> {
    const response = await axios.put(`${API_BASE_URL}/members/${id}`, memberData);
    return response.data;
  },

  async deleteMember(id: number): Promise<ApiResponse<void>> {
    const response = await axios.delete(`${API_BASE_URL}/members/${id}`);
    return response.data;
  },

  // Purchases
  async getPurchases(page = 1, limit = 10, filters: any = {}): Promise<PaginatedResponse<Purchase>> {
    const params = { page, limit, ...filters };
    const response = await axios.get(`${API_BASE_URL}/purchases`, { params });
    return response.data;
  },

  async createPurchase(purchaseData: {
    member_id: number;
    item_name: string;
    quantity: number;
    rate: number;
    invoice_no?: string;
    invoice_date?: string;
    description?: string;
  }): Promise<ApiResponse<Purchase>> {
    const response = await axios.post(`${API_BASE_URL}/purchases`, purchaseData);
    return response.data;
  },

  // Issues
  async getIssues(page = 1, limit = 10, filters: any = {}): Promise<PaginatedResponse<Issue>> {
    const params = { page, limit, ...filters };
    const response = await axios.get(`${API_BASE_URL}/issues`, { params });
    return response.data;
  },

  async createIssue(issueData: {
    member_id: number;
    item_name: string;
    quantity: number;
    invoice_no?: string;
    invoice_date?: string;
    description?: string;
  }): Promise<ApiResponse<Issue>> {
    const response = await axios.post(`${API_BASE_URL}/issues`, issueData);
    return response.data;
  },

  // Transactions
  async getTransactions(page = 1, limit = 10, filters: any = {}): Promise<PaginatedResponse<Transaction>> {
    const params = { page, limit, ...filters };
    const response = await axios.get(`${API_BASE_URL}/transactions`, { params });
    return response.data;
  },

  async getTransactionById(id: string): Promise<ApiResponse<{ transaction: Transaction }>> {
    const response = await axios.get(`${API_BASE_URL}/transactions/${id}`);
    return response.data;
  }
};
