import axios from 'axios';
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionsResponse,
  ParseExpenseRequest,
  ParseExpenseResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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

  // Update existing transaction
  updateTransaction: async (id: string, data: TransactionUpdateInput): Promise<Transaction> => {
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
