import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../api/client';
import type { Account } from '../types';

export const ACCOUNT_QUERY_KEYS = {
  accounts: ['accounts'] as const,
};

// Hook to get all accounts
export const useAccounts = () => {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.accounts,
    queryFn: () => accountsApi.getAccounts(),
    staleTime: 5 * 60 * 1000, // Consider accounts fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};

// Hook to get accounts as a map for faster lookup
export const useAccountsMap = () => {
  const { data, ...rest } = useAccounts();
  
  const accountsMap = new Map<string, Account>();
  if (data?.accounts) {
    data.accounts.forEach(account => {
      accountsMap.set(account.id, account);
    });
  }
  
  return {
    accountsMap,
    accounts: data?.accounts || [],
    ...rest,
  };
};

// Utility function to get account name by ID
export const getAccountName = (accountId: string | undefined, accountsMap: Map<string, Account>): string => {
  if (!accountId) return 'No Account';
  
  const account = accountsMap.get(accountId);
  return account ? account.name : `Unknown Account (${accountId})`;
};
