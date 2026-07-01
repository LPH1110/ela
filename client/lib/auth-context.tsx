"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { api, setAccessToken } from "./api";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role?: string;
  orgId?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRefreshing: boolean; // For silent refresh UI state
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Guard against re-entrant checkSession calls
  const checkingRef = useRef(false);

  const login = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setAccessToken(null);
      setUser(null);
      // Clear the refresh token cookie so middleware doesn't bounce us back to dashboard
      document.cookie = "ela_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      router.push("/login");
    }
  }, [router]);

  const checkSession = useCallback(async () => {
    // Prevent concurrent / re-entrant calls that cause render loops
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      setIsRefreshing(true);
      const res = await api.get("/auth/me");
      if (res.ok) {
        const data = await res.json();
        // Only update user state if the data actually changed (avoids new-object-reference re-renders)
        setUser((prev) => {
          if (
            prev &&
            prev.id === data.user.id &&
            prev.email === data.user.email &&
            prev.fullName === data.user.fullName &&
            prev.orgId === data.user.orgId &&
            prev.role === data.user.role
          ) {
            return prev; // Same data — keep the same reference to avoid re-renders
          }
          return data.user;
        });
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Listen for unauthorized events from the API client
    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
        router.push("/login");
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [checkSession, router]);

  useEffect(() => {
    if (!isLoading) {
      if (user && !user.orgId) {
        if (pathname !== "/onboarding" && !pathname.startsWith("/invite/accept") && !pathname.startsWith("/auth/callback")) {
          router.push("/onboarding");
        }
      } else if (user && user.orgId && pathname === "/onboarding") {
        router.push("/");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Memoize context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isRefreshing,
    login,
    logout,
    checkSession,
  }), [user, isLoading, isRefreshing, login, logout, checkSession]);

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Brief loading indicator during silent refresh (per user feedback) */}
      {isRefreshing && !isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50 overflow-hidden">
            <div className="h-full bg-primary animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: "30%", animation: "indeterminate 1.5s infinite linear" }} />
            <style jsx>{`
                @keyframes indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
