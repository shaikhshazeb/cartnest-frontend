import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login
    if (email === "admin@cartnest.com") {
      setUser({ id: "1", name: "Admin", email, isAdmin: true });
    } else {
      setUser({ id: "2", name: email.split("@")[0], email });
    }
    return true;
  };

  const register = async (name: string, email: string, _password: string): Promise<boolean> => {
    setUser({ id: "3", name, email });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
