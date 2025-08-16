import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/client';
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  ParseExpenseRequest,
} from '../types';

export const QUERY_KEYS = {
  transactions: ['transactions'] as const,
  transaction: (id: string | number) => ['transactions', String(id)] as const,
};

// Get transactions with pagination
export const useTransactions = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.transactions, page, limit],
    queryFn: () => transactionsApi.getTransactions(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

// Get single transaction
export const useTransaction = (id: string | number) => {
  return useQuery({
    queryKey: QUERY_KEYS.transaction(id),
    queryFn: () => transactionsApi.getTransaction(String(id)),
  });
};

// Create transaction mutation
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionCreateInput) => transactionsApi.createTransaction(data),
    onSuccess: () => {
      // Invalidate transactions list to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
    },
  });
};

// Update transaction mutation
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: TransactionCreateInput }) =>
      transactionsApi.updateTransaction(id, data as TransactionUpdateInput),
    onSuccess: (updatedTransaction, { id }) => {
      // Update the transaction in cache
      queryClient.setQueryData(
        QUERY_KEYS.transaction(id),
        updatedTransaction
      );
      
      // Update transaction in the list cache
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.transactions },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            transactions: oldData.transactions.map((transaction: Transaction) =>
              transaction.id === id ? updatedTransaction : transaction
            ),
          };
        }
      );
    },
  });
};

// Delete transaction mutation
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => transactionsApi.deleteTransaction(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: QUERY_KEYS.transaction(deletedId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
    },
  });
};

// Parse expense mutation
export const useParseExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParseExpenseRequest) => transactionsApi.parseExpense(data),
    onSuccess: (response) => {
      console.log('Parse expense response:', response);
      
      // Ensure we have transactions array
      if (!response.transactions || !Array.isArray(response.transactions)) {
        console.error('Invalid response format - missing transactions array');
        return;
      }

      // Optimistically add parsed transactions to cache
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.transactions },
        (oldData: any) => {
          if (!oldData) {
            console.log('No existing data, creating new cache entry');
            return {
              transactions: response.transactions,
              total: response.transactions.length,
              limit: 20,
              offset: 0,
            };
          }
          
          console.log('Updating existing cache with new transactions');
          return {
            ...oldData,
            transactions: [...response.transactions, ...oldData.transactions],
            total: (oldData.total || oldData.transactions?.length || 0) + response.transactions.length,
          };
        }
      );

      // Invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
    },
    onError: (error) => {
      console.error('Parse expense mutation error:', error);
    },
  });
};
