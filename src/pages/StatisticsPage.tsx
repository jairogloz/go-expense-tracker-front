import React, { useMemo } from "react";
import { Box, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency, getCategoryLabel } from "../utils";
import type { Transaction } from "../types";

const StatisticsPage: React.FC = () => {
  // Fetch a larger set of transactions for better statistics
  const { data, isLoading, error } = useTransactions(1, 1000);

  // Calculate statistics from real transaction data
  const statistics = useMemo(() => {
    if (!data?.transactions) {
      return {
        categoryData: [],
        monthlyData: [],
        totalExpenses: 0,
        totalIncome: 0,
        primaryCurrency: "USD",
      };
    }

    const transactions = data.transactions;

    // Determine the primary currency (most used currency)
    const currencyCount = new Map<string, number>();
    transactions.forEach((transaction: Transaction) => {
      const currency = transaction.currency.toUpperCase();
      currencyCount.set(currency, (currencyCount.get(currency) || 0) + 1);
    });

    const primaryCurrency =
      Array.from(currencyCount.entries()).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] || "USD";

    // Calculate category breakdown for expenses (only primary currency)
    const categoryMap = new Map<string, number>();
    let totalExpenses = 0;
    let totalIncome = 0;

    transactions.forEach((transaction: Transaction) => {
      // Only count transactions in the primary currency for consistency
      if (transaction.currency.toUpperCase() === primaryCurrency) {
        if (transaction.type === "expense") {
          totalExpenses += transaction.amount;
          const category = getCategoryLabel(transaction.category);
          categoryMap.set(
            category,
            (categoryMap.get(category) || 0) + transaction.amount
          );
        } else if (transaction.type === "income") {
          totalIncome += transaction.amount;
        }
      }
    });

    // Convert category map to chart data with colors
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
      "#00D2D3",
      "#FF9F43",
      "#10AC84",
      "#EE5A24",
    ];

    const categoryData = Array.from(categoryMap.entries()).map(
      ([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      })
    );

    // Calculate monthly data (only primary currency)
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach((transaction: Transaction) => {
      if (transaction.currency.toUpperCase() === primaryCurrency) {
        const date = new Date(transaction.date);
        const monthKey = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { income: 0, expenses: 0 });
        }

        const monthData = monthlyMap.get(monthKey)!;
        if (transaction.type === "expense") {
          monthData.expenses += transaction.amount;
        } else {
          monthData.income += transaction.amount;
        }
      }
    });

    // Convert to array and sort by date
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const dateA = new Date(a.month + " 01");
        const dateB = new Date(b.month + " 01");
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Show last 6 months

    return {
      categoryData,
      monthlyData,
      totalExpenses,
      totalIncome,
      primaryCurrency,
    };
  }, [data]);

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Statistics
        </Typography>
        <Alert severity="error">
          Failed to load transaction data. Please check if the backend server is
          running.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Box>
    );
  }

  const {
    categoryData,
    monthlyData,
    totalExpenses,
    totalIncome,
    primaryCurrency,
  } = statistics;

  // Show message if no transactions available
  if (!data?.transactions?.length) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Statistics
        </Typography>
        <Alert severity="info">
          No transaction data available. Add some transactions to see
          statistics.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      {data?.transactions && data.transactions.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Statistics calculated for transactions in {primaryCurrency}
        </Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Summary Cards */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Paper sx={{ p: 2, textAlign: "center", flex: "1 1 200px" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" color="error.main">
              {formatCurrency(totalExpenses, primaryCurrency)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: "center", flex: "1 1 200px" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" color="success.main">
              {formatCurrency(totalIncome, primaryCurrency)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: "center", flex: "1 1 200px" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Net Balance
            </Typography>
            <Typography
              variant="h4"
              color={
                totalIncome - totalExpenses >= 0 ? "success.main" : "error.main"
              }
            >
              {formatCurrency(totalIncome - totalExpenses, primaryCurrency)}
            </Typography>
          </Paper>
        </Box>

        {/* Charts */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* Expenses by Category Chart */}
          <Paper sx={{ p: 2, flex: "1 1 400px" }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value), primaryCurrency)
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No expense data available
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Monthly Income vs Expenses */}
          <Paper sx={{ p: 2, flex: "1 1 400px" }}>
            <Typography variant="h6" gutterBottom>
              Monthly Income vs Expenses
            </Typography>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value), primaryCurrency)
                    }
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#4ECDC4" name="Income" />
                  <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No monthly data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Category Breakdown Table */}
        {categoryData.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {categoryData.map((category) => (
                <Box
                  key={category.name}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "grey.50",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: category.color,
                      }}
                    />
                    <Typography variant="body2">{category.name}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(category.value, primaryCurrency)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default StatisticsPage;
