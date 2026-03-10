import React, { createContext, useContext, useState, useEffect } from "react";

const API = "https://cartnest-backend-k55k.onrender.com";

interface User {
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (username && role) {
      setUser({
        username,
        email: "",
        role
      });
    }

  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {

    try {

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) return false;

      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      setUser({
        username: data.username,
        email,
        role: data.role
      });

      return true;

    } catch (err) {

      console.error(err);
      return false;

    }

  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {

    try {

      const res = await fetch(`${API}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
          role: "CUSTOMER"
        })
      });

      return res.ok;

    } catch (err) {

      console.error(err);
      return false;

    }

  };

  const logout = () => {

    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setUser(null);

  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};

export const useAuth = () => {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;

};