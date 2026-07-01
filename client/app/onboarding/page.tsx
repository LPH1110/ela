"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, MailOpen, ArrowRight, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, logout, user } = useAuth();
  const router = useRouter();

  const { 
    register: registerCreate, 
    handleSubmit: handleSubmitCreate, 
    formState: { errors: errorsCreate } 
  } = useForm();
  
  const { 
    register: registerJoin, 
    handleSubmit: handleSubmitJoin, 
    formState: { errors: errorsJoin } 
  } = useForm();

  const onCreateOrgSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post("/orgs", { name: data.name });
      const json = await res.json();

      if (res.ok) {
        login(json.accessToken, json.user);
        toast.success(`Organization "${data.name}" created successfully!`);
        router.push("/");
      } else {
        const errorMsg = json.error?.message || "Failed to create organization";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const onJoinOrgSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post("/invitations/accept", { token: data.token });
      const json = await res.json();

      if (res.ok) {
        login(json.accessToken, json.user);
        toast.success("Workspace joined successfully!");
        router.push("/");
      } else {
        const errorMsg = json.error?.message || "Failed to join organization";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/30">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-border bg-card flex justify-between items-center">
        <div className="flex items-center gap-2 font-semibold text-foreground text-lg tracking-tight">
          <Sparkles className="w-5 h-5 text-accent" />
          <span>ELA Onboarding</span>
        </div>
        <Button variant="ghost" onClick={logout} className="text-sm cursor-pointer">
          Sign Out
        </Button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          
          {/* Left panel info */}
          <div className="md:w-5/12 bg-primary text-primary-foreground p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Welcome, {user?.fullName || "User"}</h2>
              <p className="text-xs text-primary-foreground/75 mt-2 leading-relaxed">
                Let's set up your workspace context. You can either spin up a brand new organization or connect via a pending membership invitation.
              </p>
            </div>
            <div className="mt-8 md:mt-0 text-[11px] text-primary-foreground/50 border-t border-primary-foreground/10 pt-4">
              Need assistance? Contact your system administrator or support team.
            </div>
          </div>

          {/* Right panel interactive form */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="flex bg-muted p-1 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "create"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Create Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "join"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MailOpen className="w-4 h-4" />
                  <span>Join Workspace</span>
                </button>
              </div>

              {/* Create Workspace Form */}
              {activeTab === "create" && (
                <form onSubmit={handleSubmitCreate(onCreateOrgSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                      Organization / Workspace Name
                    </label>
                    <input
                      {...registerCreate("name", { required: "Organization name is required" })}
                      type="text"
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="e.g. Acme Corporation"
                    />
                    {errorsCreate.name && (
                      <p className="text-xs text-destructive mt-1">{errorsCreate.name.message as string}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Creating a workspace registers you as the OWNER role, allowing you to invite team members and automate integrations.
                  </p>
                  <Button type="submit" className="w-full mt-2 cursor-pointer" disabled={isLoading}>
                    {isLoading ? "Setting up..." : "Create Organization"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              )}

              {/* Join Workspace Form */}
              {activeTab === "join" && (
                <form onSubmit={handleSubmitJoin(onJoinOrgSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                      Invitation Token / Code
                    </label>
                    <input
                      {...registerJoin("token", { required: "Invitation code is required" })}
                      type="text"
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Paste your invitation token..."
                    />
                    {errorsJoin.token && (
                      <p className="text-xs text-destructive mt-1">{errorsJoin.token.message as string}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Enter the code from the invitation email you received. Once accepted, you'll be immediately added to the workspace.
                  </p>
                  <Button type="submit" className="w-full mt-2 cursor-pointer" disabled={isLoading}>
                    {isLoading ? "Validating token..." : "Join Workspace"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border bg-card">
        &copy; {new Date().getFullYear()} Kinetic ELA. All rights reserved.
      </footer>
    </div>
  );
}
