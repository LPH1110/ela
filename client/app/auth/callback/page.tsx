"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkSession, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard: only run once to prevent loops from dependency changes
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    const err = searchParams.get("error");

    if (err) {
      setError("OAuth authentication failed. Please try again.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (token) {
      // Store token securely in memory
      setAccessToken(token);
      
      // Fetch user profile to complete login
      checkSession().then(async () => {
        // After establishing the session, check if there's a pending invitation to accept
        const inviteToken = localStorage.getItem("ela_invite_token");
        if (inviteToken) {
          try {
            const res = await api.post("/invitations/accept", { token: inviteToken });
            if (res.ok) {
              const json = await res.json();
              // Update the auth context with the new organization-bound token and roles
              if (json.accessToken) {
                login(json.accessToken, json.user);
              }
            }
          } catch (e) {
            console.error("Failed to automatically accept invitation after OAuth:", e);
          } finally {
            localStorage.removeItem("ela_invite_token");
          }
        }
        
        router.push("/");
      }).catch(() => {
        setError("Failed to fetch user profile.");
        setTimeout(() => router.push("/login"), 3000);
      });
    } else {
      setError("No authentication token found.");
      setTimeout(() => router.push("/login"), 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="p-8 bg-card border border-border rounded-xl text-center shadow-sm max-w-sm w-full">
          <div className="text-destructive mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-foreground mb-2">Authenticating...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we securely log you in.</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
