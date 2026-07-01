"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import {
    MessageSquare,
    Cat,
    CheckSquare,
    Mail,
    CheckCircle2,
    Loader2,
    Info
} from "lucide-react";
import { ReactNode } from "react";

interface OffboardingSheetProps {
    children: ReactNode;
}

export default function OffboardingSheet({ children }: OffboardingSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            {/* Cấu hình chiều rộng cho Sheet (max-w-md tương đương khoảng 450px) */}
            <SheetContent className="w-full sm:max-w-md sm:w-[450px] p-0 flex flex-col gap-0 border-l border-border bg-background">

                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b border-border bg-card flex flex-col gap-1 text-left">
                    <SheetTitle className="text-xl text-foreground">Offboard Employee</SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-muted-foreground">Alex Rivera</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            Immediate Action
                        </span>
                    </div>
                </SheetHeader>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Employee Context Card */}
                    <div className="bg-card border border-border rounded-lg p-4 flex gap-4 items-center shadow-sm">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9JHLkQk3mHtXPetRVmHpZHFmZGUCavoCPdytKOq9cBfTttMWJ1FOF4wSIl5AKG9gdq4Yrj76XtUop6610IZukER-47RnFqTJCr0YCMGElyyerX4MQZtF887elLB0GB-cTaEr4aTryWynLCSr1aQXJeCWz90ez6joCG93YZSZ0YeO2GMKBYFmpQU-0kgoPDmQag7nSrc5EzkuaHhQXW9lnqrOYEUQUaMQQeH5tMtnVgMg-xMkRZ3DNnoLC705IIftyv0vIn-bwai63"
                                alt="Alex Rivera"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-lg font-medium text-foreground leading-tight">Alex Rivera</div>
                            <div className="text-sm text-muted-foreground">Senior Frontend Engineer</div>
                        </div>
                    </div>

                    {/* Revocation Checklist */}
                    <div>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Revocation Checklist
                        </h3>
                        <div className="space-y-3">

                            {/* Slack (Done) */}
                            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-foreground">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">Slack</div>
                                        <div className="text-xs text-muted-foreground">Workspace Access</div>
                                    </div>
                                </div>
                                <div className="flex items-center text-emerald-500">
                                    <CheckCircle2 size={20} className="fill-emerald-500/20" />
                                </div>
                            </div>

                            {/* Cat (Pending) */}
                            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-foreground">
                                        <Cat size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">GitHub</div>
                                        <div className="text-xs text-muted-foreground">Organization Access</div>
                                    </div>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Loader2 size={18} className="animate-spin" />
                                </div>
                            </div>

                            {/* Jira (Pending) */}
                            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-foreground">
                                        <CheckSquare size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">Jira</div>
                                        <div className="text-xs text-muted-foreground">Project Access</div>
                                    </div>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Loader2 size={18} className="animate-spin" />
                                </div>
                            </div>

                            {/* Google Workspace (Pending) */}
                            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-foreground">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">Google Workspace</div>
                                        <div className="text-xs text-muted-foreground">Email & Drive</div>
                                    </div>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Loader2 size={18} className="animate-spin" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-muted/50 p-4 rounded-lg border border-border flex gap-3 text-muted-foreground">
                        <Info size={20} className="mt-0.5 shrink-0" />
                        <p className="text-sm">
                            Automated revocation processes take approximately 2-5 minutes. You may confirm offboarding while tasks complete in the background.
                        </p>
                    </div>

                </div>

                {/* Footer Actions */}
                <SheetFooter className="p-6 border-t border-border bg-card flex sm:justify-end gap-3">
                    <SheetClose asChild>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button variant="destructive" className="shadow-sm">
                        Confirm Offboard
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}