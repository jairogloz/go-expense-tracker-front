import React, { useState } from "react";
import {
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { useParseExpense } from "../hooks/useTransactions";

interface ExpenseInputProps {
  onExpenseParsed?: () => void;
}

const ExpenseInput: React.FC<ExpenseInputProps> = ({ onExpenseParsed }) => {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseExpenseMutation = useParseExpense();

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setError(null);

    try {
      await parseExpenseMutation.mutateAsync({
        text: inputText.trim(),
      });
      setInputText("");
      onExpenseParsed?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to parse expense";
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Expense
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Describe your expense in natural language (e.g., "Spent $15 on lunch at
        McDonald's today")
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your expense here... (e.g., 'Bought groceries for $85 at Whole Foods')"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={parseExpenseMutation.isPending}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <IconButton
          onClick={handleSubmit}
          disabled={!inputText.trim() || parseExpenseMutation.isPending}
          color="primary"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&:disabled": {
              bgcolor: "grey.300",
            },
          }}
        >
          {parseExpenseMutation.isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Send />
          )}
        </IconButton>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Press Enter to send, Shift+Enter for new line
      </Typography>
    </Paper>
  );
};

export default ExpenseInput;
