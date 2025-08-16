// Testing utilities for authentication flow
// You can import and use these in your components for debugging

import { getCurrentToken, isAuthenticated, refreshToken } from '../api/client';

export const authTestUtils = {
  // Log current token to console (useful for debugging)
  logCurrentToken: async () => {
    const token = await getCurrentToken();
    console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'No token');
    return token;
  },

  // Check authentication status
  checkAuth: async () => {
    const isAuth = await isAuthenticated();
    console.log('Is authenticated:', isAuth);
    return isAuth;
  },

  // Test token refresh
  testRefresh: async () => {
    console.log('Testing token refresh...');
    const success = await refreshToken();
    console.log('Refresh successful:', success);
    return success;
  },

  // Test API call (will trigger token handling)
  testApiCall: async () => {
    try {
      const { transactionsApi } = await import('../api/client');
      console.log('Testing API call...');
      const response = await transactionsApi.getTransactions(1, 5);
      console.log('API call successful:', response);
      return response;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Test parse expense endpoint specifically
  testParseExpense: async (text: string = 'Compre comida por $100 pesos') => {
    try {
      const { transactionsApi } = await import('../api/client');
      console.log('Testing parse expense with text:', text);
      const response = await transactionsApi.parseExpense({ text });
      console.log('Parse expense successful:', response);
      return response;
    } catch (error) {
      console.error('Parse expense failed:', error);
      throw error;
    }
  },
};

// Usage examples:
// 1. In browser console: authTestUtils.logCurrentToken()
// 2. In component: authTestUtils.checkAuth()
// 3. Test refresh: authTestUtils.testRefresh()
// 4. Test API: authTestUtils.testApiCall()
