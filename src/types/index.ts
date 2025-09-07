export interface Transaction {
  id: string | number; // Backend can return number for new transactions
  user_id?: string; // Optional user_id field from backend
  amount: number;
  currency: string;
  category: string;
  sub_category?: string;
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
  sub_category?: string;
  type: 'expense' | 'income';
  date: string;
  description: string;
}

export interface TransactionUpdateInput {
  amount?: number;
  currency?: string;
  category?: string;
  sub_category?: string;
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
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
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

// Authentication types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

// Category and subcategory constants
export const EXPENSE_CATEGORIES = {
  guilt_free: 'guilt_free_spending',
  fixed_costs: 'fixed_costs',
  investments: 'investments',
  savings: 'savings_goals'
} as const;

export const INCOME_CATEGORIES = {
  salary: 'salary',
  freelance: 'freelance', 
  investments: 'investments',
  bonus: 'bonus'
} as const;

export const SUBCATEGORIES = {
  fixed_costs: [
    'house_payments',
    'utilities',
    'internet_and_phone',
    'insurance',
    'loan_payments',
    'subscriptions'
  ],
  investments: [
    'afore',
    'cetes',
    'mutual_funds',
    'retirement_savings',
    'stocks',
    'real_estate',
    'crypto'
  ],
  savings_goals: [
    'emergency_fund',
    'vacation_savings',
    'vehicle_savings',
    'wedding_savings',
    'home_down_payment',
    'medical_savings',
    'technology_savings'
  ],
  guilt_free_spending: [
    'dining_out',
    'coffee_and_snacks',
    'clothing_and_accessories',
    'hobbies',
    'entertainment',
    'fitness_and_wellness',
    'gifts_and_celebrations',
    'travel',
    'gadgets_and_tech'
  ],
  // Income categories don't have subcategories in the provided data
  salary: [],
  freelance: [],
  bonus: []
} as const;

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;
export type IncomeCategory = keyof typeof INCOME_CATEGORIES;
export type SubcategoryKey = keyof typeof SUBCATEGORIES;
