import { CATEGORY_LABELS } from '../types';

// Format currency with locale-specific formatting
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Get human-readable category label
export const getCategoryLabel = (category: string): string => {
  return CATEGORY_LABELS[category.toLowerCase()] || category;
};

// Get color for transaction type
export const getTransactionTypeColor = (type: 'expense' | 'income'): string => {
  return type === 'expense' ? '#d32f2f' : '#2e7d32';
};

// Validate transaction form data
export const validateTransactionData = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!data.currency) {
    errors.push('Currency is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.type || !['expense', 'income'].includes(data.type)) {
    errors.push('Transaction type is required');
  }

  if (!data.date) {
    errors.push('Date is required');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  return errors;
};

// Debounce function for search/input
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

// Parse relative dates from natural language
export const parseRelativeDate = (text: string): string | null => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const lowerText = text.toLowerCase();

  if (lowerText.includes('today')) {
    return today.toISOString();
  }
  
  if (lowerText.includes('tomorrow')) {
    return tomorrow.toISOString();
  }
  
  if (lowerText.includes('yesterday')) {
    return yesterday.toISOString();
  }

  return null;
};

// Truncate text for display
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
