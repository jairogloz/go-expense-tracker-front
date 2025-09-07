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

// Add auth interceptor with retry logic
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Error getting session:', error);
        return config;
      }
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Token expired, attempting to refresh...');
        
        // Try to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session?.access_token) {
          console.error('Session refresh failed:', refreshError);
          // Refresh failed, sign out and redirect to login
          await supabase.auth.signOut();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        console.log('Token refreshed successfully');
        
        // Update the authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        
        // Retry the original request with the new token
        return apiClient.request(originalRequest);
        
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
        await supabase.auth.signOut();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Log API errors for debugging
    if (error.response?.status !== 401) {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
    }
    
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
  getTransaction: async (id: string | number): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (data: TransactionCreateInput): Promise<Transaction> => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },

  // Update existing transaction (requires all fields)
  updateTransaction: async (id: string | number, data: TransactionUpdateInput | TransactionCreateInput): Promise<Transaction> => {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },

  // Parse natural language expense
  parseExpense: async (data: ParseExpenseRequest): Promise<ParseExpenseResponse> => {
    const response = await apiClient.post('/parse', data);
    return response.data;
  },
};



// Utility function to get current auth token (useful for debugging)
export const getCurrentToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current token:', error);
      return null;
    }
    
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting current token:', error);
    return null;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.access_token;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Utility function to manually refresh the session (useful for testing)
export const refreshToken = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error || !session) {
      console.error('Manual token refresh failed:', error);
      return false;
    }
    
    console.log('Token manually refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error during manual token refresh:', error);
    return false;
  }
};

export default apiClient;