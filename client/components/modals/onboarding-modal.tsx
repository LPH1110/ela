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
    Cat,
    ChevronDown
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DatePicker } from "../ui/date-picker";

interface OnboardingModalProps {
    children: ReactNode;
}

interface OnboardingFormValues {
    fullName: string;
    personalEmail: string;
    department: string;
    startDate: string;
}

export default function OnboardingModal({ children }: OnboardingModalProps) {
    const [open, setOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<OnboardingFormValues>({
        defaultValues: {
            fullName: "",
            personalEmail: "",
            department: "",
            startDate: "",
        },
    });

    // Manually register custom inputs
    useEffect(() => {
        register("department", { required: "Department is required" });
        register("startDate", { required: "Start date is required" });
    }, [register]);

    const department = useWatch({
        control,
        name: "department",
    });

    const startDate = useWatch({
        control,
        name: "startDate",
    });

    const onSubmit = async (data: OnboardingFormValues) => {
        setSubmitError(null);
        try {
            const response = await fetch("http://localhost:5000/api/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: data.fullName,
                    personalEmail: data.personalEmail,
                    department: data.department,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to start onboarding flow");
            }

            reset();
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error creating employee:", error);
            setSubmitError(error instanceof Error ? error.message : "Something went wrong");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                reset();
                setSubmitError(null);
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent
                className="sm:max-w-lg p-0 gap-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Header */}
                    <DialogHeader className="px-6 py-5 border-b border-border bg-card">
                        <DialogTitle className="text-xl">Start New Employee Onboarding</DialogTitle>
                        <DialogDescription className="text-sm mt-1.5">
                            Fill in the details to trigger the automated account provisioning sequence.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form Body */}
                    <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh] custom-scrollbar bg-background">
                        {submitError && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {submitError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {/* Full Name */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Jane Doe"
                                    {...register("fullName", { required: "Full name is required" })}
                                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                                />
                                {errors.fullName && (
                                    <span className="text-xs text-destructive">{errors.fullName.message}</span>
                                )}
                            </div>

                            {/* Personal Email */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="personalEmail" className="text-sm font-medium text-foreground">Personal Email</label>
                                <input
                                    id="personalEmail"
                                    type="email"
                                    placeholder="jane.doe@example.com"
                                    {...register("personalEmail", {
                                        required: "Personal email is required",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                                />
                                {errors.personalEmail && (
                                    <span className="text-xs text-destructive">{errors.personalEmail.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Department */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Department</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" type="button" className="w-full justify-between text-left font-normal">
                                            <span>
                                                {department ? `${department}` : "Select Department"}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                        {["Engineering", "Product", "Sales", "Marketing", "HR"].map((dept) => (
                                            <DropdownMenuItem
                                                key={dept}
                                                onSelect={() => setValue("department", dept, { shouldValidate: true })}
                                                className="cursor-pointer"
                                            >
                                                {dept}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {errors.department && (
                                    <span className="text-xs text-destructive">{errors.department.message}</span>
                                )}
                            </div>

                            {/* Start Date */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Start Date</span>
                                <DatePicker
                                    value={startDate}
                                    onChange={(date) => setValue("startDate", date, { shouldValidate: true })}
                                    placeholder="Pick start date"
                                />
                                {errors.startDate && (
                                    <span className="text-xs text-destructive">{errors.startDate.message}</span>
                                )}
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
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button className="flex items-center gap-2 shadow-sm" type="submit" disabled={isSubmitting}>
                            <span>{isSubmitting ? "Launching..." : "Launch Onboarding"}</span>
                            <Rocket size={16} />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}