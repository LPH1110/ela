"use client";

import { useEffect, useState } from "react";
import { OnboardingModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import EmployeeTable, { Employee } from "@/components/directory/employee-table";
import { api } from "@/lib/api";
import { toast } from "sonner";



interface DbEmployee {
    id: string;
    fullName: string;
    personalEmail: string;
    department: string;
    status: "ONBOARDING" | "ACTIVE" | "OFFBOARDED";
}

export default function EmployeeDirectoryPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/employees");

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                const errMsg = errJson.error?.message || "Failed to fetch employees";
                throw new Error(errMsg);
            }

            const result = await response.json();
            const dbEmployees: DbEmployee[] = result.data || [];

            if (dbEmployees.length === 0) {
                setEmployees([]);
            } else {
                const formatted = dbEmployees.map((emp) => {
                    let status: Employee["status"] = "Active";
                    if (emp.status === "ONBOARDING") status = "Onboarding";
                    else if (emp.status === "OFFBOARDED") status = "Offboarded";

                    const nameParts = emp.fullName.trim().split(/\s+/);
                    const initials = nameParts.length > 0
                        ? nameParts.map(part => part[0]).join("").toUpperCase().slice(0, 2)
                        : "EE";

                    return {
                        id: emp.id,
                        name: emp.fullName,
                        email: emp.personalEmail,
                        department: emp.department,
                        status: status,
                        initials: initials,
                    };
                });
                setEmployees(formatted);
            }
        } catch (error: any) {
            console.error("Error loading employees:", error);
            toast.error(error.message || "Failed to connect to backend service.");
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    return (
        <div className="space-y-6">
            {/* Page Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                        Employee Directory
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage personnel, status, and lifecycle events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={loadEmployees} disabled={isLoading} className="cursor-pointer">
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                    <OnboardingModal onSuccess={loadEmployees}>
                        <Button className="flex items-center gap-2 px-5 py-5 rounded-lg shadow-sm cursor-pointer">
                            <Plus size={18} />
                            Add New Employee
                        </Button>
                    </OnboardingModal>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading employee directory...</div>
            ) : (
                <EmployeeTable initialEmployees={employees} />
            )}
        </div>
    );
}