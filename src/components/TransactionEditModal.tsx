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
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SUBCATEGORIES } from "../types";
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

  // Helper function to get available categories based on transaction type
  const getAvailableCategories = () => {
    if (formData.type === "expense") {
      return Object.keys(EXPENSE_CATEGORIES);
    } else if (formData.type === "income") {
      return Object.keys(INCOME_CATEGORIES);
    }
    return [];
  };

  // Helper function to get available subcategories based on selected category
  const getAvailableSubcategories = () => {
    if (!formData.category) return [];

    // Map the category to the actual subcategory key
    let subcategoryKey = formData.category;
    if (formData.type === "expense") {
      subcategoryKey =
        EXPENSE_CATEGORIES[
          formData.category as keyof typeof EXPENSE_CATEGORIES
        ];
    }

    return SUBCATEGORIES[subcategoryKey as keyof typeof SUBCATEGORIES] || [];
  };

  // Helper function to handle type change and reset category/subcategory
  const handleTypeChange = (newType: "expense" | "income") => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: "", // Reset category when type changes
      sub_category: "", // Reset subcategory when type changes
    }));
    setHasChanges(true);
    setErrors([]);
  };

  // Helper function to handle category change and reset subcategory
  const handleCategoryChange = (newCategory: string) => {
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
      sub_category: "", // Reset subcategory when category changes
    }));
    setHasChanges(true);
    setErrors([]);
  };

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        currency: transaction.currency,
        category: transaction.category,
        sub_category: transaction.sub_category,
        type: transaction.type,
        date: formatDateForInput(transaction.date),
        description: transaction.description,
      });
      setHasChanges(false);
      setErrors([]);

      // Reset mutation state when opening modal
      updateMutation.reset();
    }
  }, [transaction]); // Remove updateMutation from dependencies

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
      sub_category: formData.sub_category,
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update transaction";
      setErrors([errorMessage]);
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

        {updateMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Mutation Error:</strong> {updateMutation.error.message}
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
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || ""}
                onChange={(e) =>
                  handleTypeChange(e.target.value as "expense" | "income")
                }
                label="Type"
              >
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || ""}
                onChange={(e) => handleCategoryChange(e.target.value)}
                label="Category"
                disabled={!formData.type}
              >
                {getAvailableCategories().map((category) => (
                  <MenuItem key={category} value={category}>
                    {category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={formData.sub_category || ""}
                onChange={(e) => handleChange("sub_category", e.target.value)}
                label="Subcategory"
                disabled={
                  !formData.category || getAvailableSubcategories().length === 0
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {getAvailableSubcategories().map((subcategory) => (
                  <MenuItem key={subcategory} value={subcategory}>
                    {subcategory
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div style={{ flex: 1 }} />
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
