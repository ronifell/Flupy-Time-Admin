"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminEmployee } from "./auth";
import {
  clearSession,
  getStoredEmployee,
  getStoredToken,
  persistSession
} from "./auth";

type AuthCtx = {
  token: string | null;
  employee: AdminEmployee | null;
  setAuth: (token: string, employee: AdminEmployee) => void;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [employee, setEmployee] = useState<AdminEmployee | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setToken(getStoredToken());
    setEmployee(getStoredEmployee());
    setReady(true);
  }, []);

  const setAuth = useCallback((t: string, e: AdminEmployee) => {
    persistSession(t, e);
    setToken(t);
    setEmployee(e);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setEmployee(null);
    router.push("/time/login");
  }, [router]);

  const value = useMemo(
    () => ({ token, employee, setAuth, logout, ready }),
    [token, employee, setAuth, logout, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
