import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import type { Transaction } from "../types";
import {
  formatCurrency,
  formatDate,
  getCategoryLabel,
  getTransactionTypeColor,
} from "../utils";
import TransactionTableSkeleton from "./LoadingSkeleton";

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onTransactionClick: (transaction: Transaction) => void;
  onTransactionDelete: (transaction: Transaction) => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  onTransactionClick,
  onTransactionDelete,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const handleRowClick = (transaction: Transaction) => {
    onTransactionClick(transaction);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      onTransactionDelete(transactionToDelete);
    }
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TransactionTableSkeleton rows={rowsPerPage} />
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 4 }}
                  >
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  hover
                  onClick={() => handleRowClick(transaction)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getTransactionTypeColor(transaction.type),
                        fontWeight: "medium",
                      }}
                    >
                      {transaction.type === "expense" ? "-" : "+"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.currency.toUpperCase()}</TableCell>
                  <TableCell>
                    {getCategoryLabel(transaction.category)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                      {transaction.sub_category &&
                      transaction.sub_category.trim()
                        ? getCategoryLabel(transaction.sub_category)
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      size="small"
                      sx={{
                        backgroundColor: getTransactionTypeColor(
                          transaction.type
                        ),
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(transaction);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(transaction);
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this transaction?
            {transactionToDelete && (
              <>
                <br />
                <strong>
                  {transactionToDelete.type === "expense" ? "-" : "+"}
                  {formatCurrency(
                    transactionToDelete.amount,
                    transactionToDelete.currency
                  )}{" "}
                  - {transactionToDelete.description}
                </strong>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TransactionTable;
