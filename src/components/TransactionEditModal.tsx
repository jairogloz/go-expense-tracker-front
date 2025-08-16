import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import type { Transaction, TransactionCreateInput } from "../types";
import { CATEGORY_LABELS } from "../types";
import { useUpdateTransaction } from "../hooks/useTransactions";
import { validateTransactionData, formatDateForInput } from "../utils";

interface TransactionEditModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  open,
  transaction,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useUpdateTransaction();

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        currency: transaction.currency,
        category: transaction.category,
        type: transaction.type,
        date: formatDateForInput(transaction.date),
        description: transaction.description,
      });
      setHasChanges(false);
      setErrors([]);
    }
  }, [transaction]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setErrors([]);
  };

  const handleSubmit = async () => {
    if (!transaction || !hasChanges) return;

    const validationErrors = validateTransactionData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Send all fields as required by the backend API
    const updateData: TransactionCreateInput = {
      amount: formData.amount!,
      currency: formData.currency!,
      category: formData.category!,
      type: formData.type!,
      date: new Date(formData.date!).toISOString(),
      description: formData.description!,
    };

    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        data: updateData,
      });
      onClose();
    } catch (error) {
      setErrors(["Failed to update transaction"]);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors([]);
    setHasChanges(false);
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Transaction</DialogTitle>
      <DialogContent>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount || ""}
              onChange={(e) =>
                handleChange("amount", parseFloat(e.target.value) || 0)
              }
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              fullWidth
              label="Currency"
              value={formData.currency || ""}
              onChange={(e) => handleChange("currency", e.target.value)}
              placeholder="USD"
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                label="Category"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || ""}
                onChange={(e) => handleChange("type", e.target.value)}
                label="Type"
              >
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date || ""}
            onChange={(e) => handleChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!hasChanges || updateMutation.isPending}
          startIcon={
            updateMutation.isPending ? <CircularProgress size={20} /> : null
          }
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionEditModal;
