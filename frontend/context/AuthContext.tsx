"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY, USER_KEY } from "@/lib/api";
import { AuthResponse, RegisterPayload, Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: { fullName: string; email: string; password?: string }) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const stored = localStorage.getItem(USER_KEY);
      if (token && stored) setUser(JSON.parse(stored) as User);
    } catch {
      // storage unavailable or corrupted: stay logged out
    }
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", { username, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post("/auth/register", payload);
  }, []);

  const updateProfile = useCallback(async (payload: { fullName: string; email: string; password?: string }) => {
    const res = await api.put<User>("/auth/profile", payload);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => !!user && roles.includes(user.role),
    [user]
  );

  const value = useMemo(
    () => ({ user, ready, login, register, updateProfile, logout, hasRole }),
    [user, ready, login, register, updateProfile, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}