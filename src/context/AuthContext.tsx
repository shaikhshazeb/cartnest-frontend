import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Shape of the user stored in state and localStorage. */
export interface AuthUser {
  username: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

/** What callers receive from useAuth(). */
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "ADMIN"
  ) => Promise<boolean>;
  logout: () => void;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const BASE_URL = "https://cartnest-backend-ukav.onrender.com";
const STORAGE_KEY = "cartnest_user"; // key used in localStorage

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialise state directly from localStorage so the first render is
  // already hydrated – no flicker, no useEffect delay.
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync whenever user state changes.
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // ── login ──────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          // Surface the backend error message when available.
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.message ?? `Login failed (HTTP ${res.status})`
          );
        }

        // Backend returns: { username: string, role: "CUSTOMER" | "ADMIN" }
        const data = await res.json();

        const loggedInUser: AuthUser = {
          username: data.username,
          email,                       // backend doesn't echo email on login
          role: data.role as AuthUser["role"],
        };

        setUser(loggedInUser);
        return true;
      } catch (err) {
        // Re-throw so the calling component can show a toast/error message.
        throw err instanceof Error ? err : new Error("Login failed");
      }
    },
    []
  );

  // ── register ───────────────────────────────
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "CUSTOMER" | "ADMIN"
    ): Promise<boolean> => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: name,   // backend field is "username"
            email,
            password,
            role,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.message ?? `Registration failed (HTTP ${res.status})`
          );
        }

        // Backend returns: { user: { username, email, role, user_id, ... }, message }
        const data = await res.json();
        const registeredUser = data.user;

        const newUser: AuthUser = {
          username: registeredUser.username,
          email: registeredUser.email,
          role: registeredUser.role as AuthUser["role"],
        };

        setUser(newUser);
        return true;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Registration failed");
      }
    },
    []
  );

  // ── logout ─────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    // localStorage is cleared by the useEffect above.
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};