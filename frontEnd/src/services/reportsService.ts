
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface TotalTransaction {
  id: number;
  member_id: number;
  name: string;
  invoice_no: string;
  type: string;
  invoice_date: string;
}

export interface StockBalanceDetail {
  id: number;
  item_name: string;
  Purchase: number;
  Total_issues: number;
  remaining_quantity: number;
}

export interface StockBalanceSummary {
  item_name: string;
  total_purchase: number;
  total_issued: number;
  total_balance: number;
}

export interface TotalTransactionsResponse {
  success: boolean;
  data: {
    transactions: TotalTransaction[];
    total_count: number;
  };
}

export interface StockBalanceDetailedResponse {
  success: boolean;
  data: {
    stock_details: StockBalanceDetail[];
    total_count: number;
    as_on_date: string;
  };
}

export interface StockBalanceSummaryResponse {
  success: boolean;
  data: {
    stock_summary: StockBalanceSummary[];
    total_count: number;
    as_on_date: string;
  };
}

export const reportsService = {
  // Total Transactions Report
  async getTotalTransactions(filters: {
    start_date?: string;
    end_date?: string;
    search?: string;
  } = {}): Promise<TotalTransactionsResponse> {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(`${API_BASE_URL}/reports/total-transactions?${params.toString()}`);
    return response.data;
  },

  // Stock Balance Detailed Report
  async getStockBalanceDetailed(filters: {
    as_on_date?: string;
    search?: string;
  } = {}): Promise<StockBalanceDetailedResponse> {
    const params = new URLSearchParams();
    
    if (filters.as_on_date) params.append('as_on_date', filters.as_on_date);
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(`${API_BASE_URL}/reports/stock-balance-detailed?${params.toString()}`);
    return response.data;
  },

  // Stock Balance Summary Report
  async getStockBalanceSummary(filters: {
    as_on_date?: string;
    search?: string;
  } = {}): Promise<StockBalanceSummaryResponse> {
    const params = new URLSearchParams();
    
    if (filters.as_on_date) params.append('as_on_date', filters.as_on_date);
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(`${API_BASE_URL}/reports/stock-balance-summary?${params.toString()}`);
    return response.data;
  }
};
