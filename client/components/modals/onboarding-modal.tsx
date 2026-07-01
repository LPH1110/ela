"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Rocket,
    MessageSquare,
    CheckSquare,
    Briefcase,
    Cat
} from "lucide-react";
import { ReactNode } from "react";

interface OnboardingModalProps {
    children: ReactNode;
}

export default function OnboardingModal({ children }: OnboardingModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b border-border bg-card">
                    <DialogTitle className="text-xl">Start New Employee Onboarding</DialogTitle>
                    <DialogDescription className="text-sm mt-1.5">
                        Fill in the details to trigger the automated account provisioning sequence.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Body */}
                <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh] custom-scrollbar bg-background">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Jane Doe"
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                            />
                        </div>

                        {/* Personal Email */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="personalEmail" className="text-sm font-medium text-foreground">Personal Email</label>
                            <input
                                id="personalEmail"
                                type="email"
                                placeholder="jane.doe@example.com"
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Department */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="department" className="text-sm font-medium text-foreground">Department</label>
                            <select
                                id="department"
                                defaultValue=""
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow cursor-pointer appearance-none"
                            >
                                <option value="" disabled>Select department</option>
                                <option value="engineering">Engineering</option>
                                <option value="product">Product</option>
                                <option value="sales">Sales</option>
                                <option value="marketing">Marketing</option>
                                <option value="hr">HR</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="startDate" className="text-sm font-medium text-foreground">Start Date</label>
                            <input
                                id="startDate"
                                type="date"
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="mt-2 p-4 bg-muted/50 border border-border rounded-lg flex flex-col gap-3">
                        <h3 className="text-xs font-medium text-foreground uppercase tracking-wider">
                            Apps to be provisioned automatically:
                        </h3>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex flex-col items-center gap-1 group cursor-help" title="Slack">
                                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                                    <MessageSquare size={20} />
                                </div>
                                <span className="text-[10px] font-medium opacity-70">Slack</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-help" title="GitHub">
                                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                                    <Cat size={20} />
                                </div>
                                <span className="text-[10px] font-medium opacity-70">GitHub</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-help" title="Jira">
                                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                                    <CheckSquare size={20} />
                                </div>
                                <span className="text-[10px] font-medium opacity-70">Jira</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-help" title="Google Workspace">
                                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                                    <Briefcase size={20} />
                                </div>
                                <span className="text-[10px] font-medium opacity-70">Workspace</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="m-0 px-6 py-4 bg-card border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    {/* Sử dụng asChild với DialogClose để nút Cancel tự đóng Modal */}
                    <DialogClose asChild>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button className="flex items-center gap-2 shadow-sm" type="submit">
                        <span>Launch Onboarding Flow</span>
                        <Rocket size={16} />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}