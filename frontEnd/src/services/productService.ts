import { api } from './api';

export interface Product {
  id: number;
  item_name: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BASE_PATH = `${API_BASE_URL}/products`;

const createProduct = async (payload: { item_name: string }): Promise<Product> => {
  try {
    const res = await api.post<ApiResponse<Product>>(BASE_PATH, payload);
    return res.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to create product' };
  }
};

const getProducts = async (): Promise<Product[]> => {
  try {
    const res = await api.get<ApiResponse<Product[]>>(BASE_PATH);
    return res.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
};

const getProductById = async (id: number): Promise<Product> => {
  try {
    const res = await api.get<ApiResponse<Product>>(`${BASE_PATH}/${id}`);
    return res.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch product' };
  }
};

const updateProduct = async (id: number, payload: { name?: string }): Promise<Product> => {
  try {
    const res = await api.put<ApiResponse<Product>>(`${BASE_PATH}/${id}`, payload);
    return res.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to update product' };
  }
};

const deleteProduct = async (id: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete product' };
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
