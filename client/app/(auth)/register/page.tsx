"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      const json = await res.json();

      if (res.ok) {
        login(json.accessToken, json.user);
        toast.success("Account created successfully!");
        router.push("/onboarding");
      } else {
        const errorMsg = json.error?.message || "Registration failed";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Get started with Employee Lifecycle Automation</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <input
            {...register("fullName", { required: "Full name is required" })}
            type="text"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Jane Doe"
          />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Work Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="jane@company.com"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Password</label>
          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" }
            })}
            type="password"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message as string}</p>}
        </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <div className="border-t border-border w-full"></div>
        <div className="px-3 text-xs text-muted-foreground uppercase font-medium">Or</div>
        <div className="border-t border-border w-full"></div>
      </div>

      <div className="mt-6">
        <a href={`${API_URL}/auth/google`} className="w-full flex items-center justify-center gap-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </a>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
