"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    AlertTriangle,
    Loader2,
    Info,
    CheckCircle2
} from "lucide-react";
import { ReactNode, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface OffboardingEmployeeInfo {
    id: string;
    name: string;
    email: string;
    department: string;
    initials?: string;
}

interface OffboardingSheetProps {
    children: ReactNode;
    employee: OffboardingEmployeeInfo;
    onSuccess?: () => void;
}

export default function OffboardingSheet({ children, employee, onSuccess }: OffboardingSheetProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleOffboard = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api.post(`/employees/${employee.id}/offboard`);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || "Failed to trigger offboarding sequence");
            }

            toast.success(`Offboarding initiated for ${employee.name}`);
            setOpen(false);
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (err: any) {
            console.error("Error starting offboarding:", err);
            const msg = err.message || "Something went wrong";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setError(null);
        }}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md sm:w-[450px] p-0 flex flex-col gap-0 border-l border-border bg-background">
                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b border-border bg-card flex flex-col gap-1 text-left">
                    <SheetTitle className="text-xl text-foreground">Offboard Employee</SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-muted-foreground">{employee.name}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            Immediate Action
                        </span>
                    </div>
                </SheetHeader>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex gap-2">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Employee Context Card */}
                    <div className="bg-card border border-border rounded-lg p-4 flex gap-4 items-center shadow-sm">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                            {employee.initials || "EE"}
                        </div>
                        <div>
                            <div className="text-lg font-medium text-foreground leading-tight">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.department}</div>
                        </div>
                    </div>

                    {/* Confirmation Checklist UX */}
                    <div>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Automated Revocation
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
                                <div className="mt-0.5 text-primary">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Revoke System Access</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        All active integrations (Slack, Google Workspace, Jira, GitHub) associated with this employee will be automatically disabled or removed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-muted/50 p-4 rounded-lg border border-border flex gap-3 text-muted-foreground">
                        <Info size={20} className="mt-0.5 shrink-0" />
                        <p className="text-sm">
                            Automated revocation processes take approximately 2-5 minutes. The employee's status will update to <strong>Offboarded</strong> once all background tasks complete successfully.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <SheetFooter className="p-6 border-t border-border bg-card flex sm:justify-end gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="shadow-sm flex items-center gap-2"
                        onClick={handleOffboard}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {isSubmitting ? "Processing..." : "Confirm Offboard"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}