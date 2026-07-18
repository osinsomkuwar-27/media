import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import apiClient, { setAuthToken, getErrorMessage } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        setAuthToken(storedToken);
        const res = await apiClient.get("/auth/me");
        setToken(storedToken);
        setUser(res.data.data.user);
      }
    } catch (err) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await apiClient.post("/auth/login", { email, password });
    const { user: loggedInUser, token: newToken } = res.data.data;
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(loggedInUser);
  }

  async function register(name, email, password) {
    const res = await apiClient.post("/auth/register", { name, email, password });
    const { user: newUser, token: newToken } = res.data.data;
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    try {
      const res = await apiClient.get("/auth/me");
      setUser(res.data.data.user);
    } catch (err) {
      // silently ignore, screen-level calls will surface errors
    }
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { getErrorMessage };