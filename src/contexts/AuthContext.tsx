import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type {
  User,
  AuthState,
  LoginCredentials,
  SignupCredentials,
} from "../types";

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const transformUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  user_metadata: supabaseUser.user_metadata,
});

// Helper function to provide user-friendly error messages
const getErrorMessage = (error: any): string => {
  const message = error.message || error.toString();

  // Custom error messages for common Supabase auth errors
  if (message.includes("Email not confirmed")) {
    return "Please check your email and click the verification link before signing in. Check your spam folder if you don't see it.";
  }

  if (message.includes("Invalid login credentials")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  if (message.includes("User already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (message.includes("Password should be at least")) {
    return "Password must be at least 6 characters long.";
  }

  if (message.includes("Unable to validate email address")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("Email rate limit exceeded")) {
    return "Too many email requests. Please wait a few minutes before trying again.";
  }

  // Return original message if no custom mapping found
  return message;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          user: session?.user ? transformUser(session.user) : null,
          loading: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: { message: error.message },
          loading: false,
        }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ? transformUser(session.user) : null,
        loading: false,
        error: null,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Don't set loading to false here - let the auth state change handler do it
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: { message: getErrorMessage(error) },
        loading: false,
      }));
      throw error;
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      if (credentials.password !== credentials.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: { message: getErrorMessage(error) },
        loading: false,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: { message: error.message },
        loading: false,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: { message: getErrorMessage(error) },
        loading: false,
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
