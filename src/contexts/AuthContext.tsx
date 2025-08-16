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
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: { message: error.message },
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
        error: { message: error.message },
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
        error: { message: error.message },
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
