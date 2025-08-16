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
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import type { SignupCredentials } from "../types";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, error } = useAuth();
  const [formData, setFormData] = useState<SignupCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof SignupCredentials) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
      setFormErrors([]);
      setSuccessMessage("");
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
    } else if (formData.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (!formData.confirmPassword) {
      errors.push("Confirm password is required");
    } else if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
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
      setIsSubmitting(true);
      setFormErrors([]);
      setSuccessMessage("");
      await signUp(formData);
      setSuccessMessage(
        "Account created successfully! Please check your email to verify your account."
      );
      // Optionally navigate to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      // Error is handled by AuthContext
      console.error("Signup failed:", error);
    } finally {
      setIsSubmitting(false);
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
              Sign Up
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Create your Expense Tracker account
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange("password")}
                error={formErrors.some((err) =>
                  err.toLowerCase().includes("password")
                )}
                helperText="Password must be at least 6 characters"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={formErrors.some(
                  (err) =>
                    err.toLowerCase().includes("confirm") ||
                    err.toLowerCase().includes("match")
                )}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Sign Up"}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign in
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

export default SignupPage;
