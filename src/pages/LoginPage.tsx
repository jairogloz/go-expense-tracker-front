import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Link,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import type { LoginCredentials } from "../types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleChange =
    (field: keyof LoginCredentials) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
      setFormErrors([]);
    };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Email is invalid");
    }

    if (!formData.password) {
      errors.push("Password is required");
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      await signIn(formData);
      navigate("/"); // Redirect to dashboard after successful login
    } catch (error) {
      // Error is handled by AuthContext
      console.error("Login failed:", error);
    }
  };

  const displayErrors =
    formErrors.length > 0 ? formErrors : error ? [error.message] : [];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Sign In
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Welcome back to Expense Tracker
            </Typography>

            {displayErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {displayErrors.map((err, index) => (
                  <div key={index}>{err}</div>
                ))}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange("email")}
                error={formErrors.some((err) =>
                  err.toLowerCase().includes("email")
                )}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange("password")}
                error={formErrors.some((err) =>
                  err.toLowerCase().includes("password")
                )}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Sign In"}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Box textAlign="center">
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                >
                  Forgot password?
                </Link>
              </Box>

              <Box textAlign="center" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Don't have an account?{" "}
                  <Link component={RouterLink} to="/signup" variant="body2">
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
