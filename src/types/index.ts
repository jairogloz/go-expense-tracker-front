export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  category: string;
  type: 'expense' | 'income';
  date: string; // ISO date string
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionCreateInput {
  amount: number;
  currency: string;
  category: string;
  type: 'expense' | 'income';
  date: string;
  description: string;
}

export interface TransactionUpdateInput {
  amount?: number;
  currency?: string;
  category?: string;
  type?: 'expense' | 'income';
  date?: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  transactions: T[];
  limit: number;
  offset: number;
  total?: number;
  totalPages?: number;
}

export interface TransactionsResponse extends PaginatedResponse<Transaction> {}

export interface ParseExpenseRequest {
  text: string;
}

export interface ParseExpenseResponse {
  transactions: Transaction[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

// Utility types for forms
export type TransactionFormData = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;

// Categories mapping for display
export const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  healthcare: 'Healthcare',
  education: 'Education',
  travel: 'Travel',
  other: 'Other',
  salary: 'Salary',
  investment: 'Investment',
  gift: 'Gift',
  freelance: 'Freelance',
};

export const TRANSACTION_TYPES = {
  expense: 'Expense',
  income: 'Income',
} as const;
