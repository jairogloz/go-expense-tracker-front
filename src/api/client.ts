import axios from 'axios';
import { supabase } from '../lib/supabase';
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionsResponse,
  ParseExpenseRequest,
  ParseExpenseResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        // Refresh failed, redirect to login
        await supabase.auth.signOut();
        window.location.href = '/login';
      } else {
        // Retry the original request
        return apiClient.request(error.config);
      }
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const transactionsApi = {
  // Get all transactions with pagination
  getTransactions: async (page = 1, limit = 20): Promise<TransactionsResponse> => {
    const offset = (page - 1) * limit;
    const response = await apiClient.get(`/transactions?offset=${offset}&limit=${limit}&sort=date&order=desc`);
    return response.data;
  },

  // Get single transaction
  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (data: TransactionCreateInput): Promise<Transaction> => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },

  // Update existing transaction (requires all fields)
  updateTransaction: async (id: string, data: TransactionUpdateInput | TransactionCreateInput): Promise<Transaction> => {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },

  // Parse natural language expense
  parseExpense: async (data: ParseExpenseRequest): Promise<ParseExpenseResponse> => {
    const response = await apiClient.post('/parse', data);
    return response.data;
  },
};

export default apiClient;