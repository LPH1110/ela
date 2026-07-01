"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Info } from "lucide-react";

function LoginContent() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");

  useEffect(() => {
    if (inviteToken) {
      localStorage.setItem("ela_invite_token", inviteToken);
    }
  }, [inviteToken]);

  // Automatically accept the invitation if the user is already authenticated
  useEffect(() => {
    if (!authLoading && user && inviteToken) {
      setIsLoading(true);
      api.post("/invitations/accept", { token: inviteToken })
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            if (json.accessToken) {
              login(json.accessToken, json.user);
            }
            toast.success("Workspace invitation accepted!");
            localStorage.removeItem("ela_invite_token");
            router.push("/");
          } else {
            const json = await res.json().catch(() => ({}));
            toast.error(json.error?.message || "Failed to accept workspace invitation.");
            localStorage.removeItem("ela_invite_token");
          }
        })
        .catch((err) => {
          toast.error("Failed to automatically accept invitation.");
          localStorage.removeItem("ela_invite_token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user, authLoading, inviteToken, login, router]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const json = await res.json();

      if (res.ok) {
        let finalAccessToken = json.accessToken;
        let finalUser = json.user;

        // Process invite if they did a standard login
        if (inviteToken) {
            try {
                const inviteRes = await api.post("/invitations/accept", { token: inviteToken });
                const inviteJson = await inviteRes.json();
                if (inviteRes.ok) {
                    finalAccessToken = inviteJson.accessToken || finalAccessToken;
                    finalUser = inviteJson.user || finalUser;
                    localStorage.removeItem("ela_invite_token");
                }
            } catch (e) {
                console.error("Failed to automatically accept invitation after login:", e);
            }
        }

        login(finalAccessToken, finalUser);
        toast.success(`Welcome back, ${finalUser.fullName || "User"}!`);
        router.push("/");
      } else {
        const errorMsg = json.error?.message || "Login failed";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (user && inviteToken)) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-muted-foreground">Accepting workspace invitation...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {inviteToken && (
        <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-md flex items-start gap-3">
            <Info className="text-primary mt-0.5 shrink-0" size={16} />
            <div className="text-sm text-primary">
                <strong>You've been invited!</strong> Please sign in with Google or your existing account to accept the workspace invitation.
            </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your ELA account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="name@company.com"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Password</label>
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message as string}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <div className="border-t border-border w-full"></div>
        <div className="px-3 text-xs text-muted-foreground uppercase font-medium">Or</div>
        <div className="border-t border-border w-full"></div>
      </div>

      <div className="mt-6">
        <a href={`${API_URL}/auth/google`} className="w-full flex items-center justify-center gap-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </a>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
