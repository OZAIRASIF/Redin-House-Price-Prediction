"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("auth-token"); // ✅ check cookies, not localStorage
    setIsAuthenticated(!!token);
  }, []);

  const login = (token) => {
    Cookies.set("auth-token", token, { expires: 7 }); // ✅ store in cookie (7 days)
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("auth-token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
