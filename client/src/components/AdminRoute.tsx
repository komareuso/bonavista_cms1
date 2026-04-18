import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function getAdminRouteState({
  loading,
  isAuthenticated,
  role,
}: {
  loading: boolean;
  isAuthenticated: boolean;
  role?: string | null;
}) {
  if (loading) return "loading" as const;
  if (!isAuthenticated) return "login" as const;
  if (role !== "admin") return "redirect" as const;
  return "allow" as const;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const state = getAdminRouteState({ loading, isAuthenticated, role: user?.role });

  useEffect(() => {
    if (state === "login") {
      window.location.href = getLoginUrl();
      return;
    }

    if (state === "redirect") {
      setLocation("/");
    }
  }, [setLocation, state]);

  if (state === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Checking access...</div>;
  }

  if (state === "login") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Redirecting to login...</div>;
  }

  if (state === "redirect") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Redirecting...</div>;
  }

  return <>{children}</>;
}
