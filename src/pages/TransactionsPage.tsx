import React, { useState } from "react";
import { Box, Typography, Alert, Snackbar } from "@mui/material";
import TransactionTable from "../components/TransactionTable";
import TransactionEditModal from "../components/TransactionEditModal";
import ExpenseInput from "../components/ExpenseInput";
import {
  useTransactions,
  useDeleteTransaction,
} from "../hooks/useTransactions";
import type { Transaction } from "../types";

const TransactionsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data, isLoading, error } = useTransactions(page + 1, rowsPerPage);
  const deleteTransactionMutation = useDeleteTransaction();

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleTransactionDelete = async (transaction: Transaction) => {
    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
      setSnackbar({
        open: true,
        message: "Transaction deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete transaction",
        severity: "error",
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpenseParsed = () => {
    // Refresh the current page to show new transactions
    // React Query will automatically refetch due to cache invalidation
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load transactions. Please check if the backend server is
          running at http://localhost:8080
        </Alert>

        {/* Show ExpenseInput even when there's an error */}
        <ExpenseInput onExpenseParsed={handleExpenseParsed} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      {/* Add Transaction Input */}
      <ExpenseInput onExpenseParsed={handleExpenseParsed} />

      {/* Transactions Table */}
      <Box sx={{ mt: 3 }}>
        <TransactionTable
          transactions={data?.transactions || []}
          loading={isLoading}
          onTransactionClick={handleTransactionClick}
          onTransactionDelete={handleTransactionDelete}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data?.total || data?.transactions?.length || 0}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <TransactionEditModal
        open={modalOpen}
        transaction={selectedTransaction}
        onClose={handleModalClose}
      />

      {/* Success/Error Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsPage;
