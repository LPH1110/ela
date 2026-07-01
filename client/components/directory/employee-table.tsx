"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    UserMinus,
    XCircle,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import OffboardingSheet from "@/components/modals/offboarding-sheet";

export type Employee = {
    id: string;
    name: string;
    email: string;
    department: string;
    status: "Active" | "Onboarding" | "Offboarded";
    avatarUrl?: string;
    initials?: string;
};

interface EmployeeTableProps {
    initialEmployees: Employee[];
}

export default function EmployeeTable({ initialEmployees }: EmployeeTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All Departments");
    const [statusFilter, setStatusFilter] = useState("All Statuses");

    // Filter logic
    const filteredEmployees = initialEmployees.filter((emp) => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment =
            departmentFilter === "All Departments" ||
            emp.department.toLowerCase() === departmentFilter.toLowerCase();

        const matchesStatus =
            statusFilter === "All Statuses" ||
            emp.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Filters & Controls Bar (Minimalist) */}
            <div className="flex flex-wrap items-center gap-3 pb-2">
                {/* Search Input */}
                <div className="flex items-center bg-card rounded-md px-3 py-2.5 border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm w-full md:w-64">
                    <Search size={16} className="text-muted-foreground mr-2" />
                    <input
                        className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full text-foreground placeholder:text-muted-foreground outline-none"
                        placeholder="Search directory..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Department Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Filter size={14} className="mr-2" />
                            <span>Department</span>
                            <ChevronDown size={14} className="ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All Departments</DropdownMenuItem>
                        <DropdownMenuItem>Engineering</DropdownMenuItem>
                        <DropdownMenuItem>Product</DropdownMenuItem>
                        <DropdownMenuItem>Sales</DropdownMenuItem>
                        <DropdownMenuItem>Marketing</DropdownMenuItem>
                        <DropdownMenuItem>HR</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Filter size={14} className="mr-2" />
                            <span>Status</span>
                            <ChevronDown size={14} className="ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All Statuses</DropdownMenuItem>
                        <DropdownMenuItem>Active</DropdownMenuItem>
                        <DropdownMenuItem>Onboarding</DropdownMenuItem>
                        <DropdownMenuItem>Offboarded</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Data Table Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold w-1/4">Name</th>
                                <th className="px-6 py-4 font-semibold w-1/4">Email</th>
                                <th className="px-6 py-4 font-semibold w-1/6">Department</th>
                                <th className="px-6 py-4 font-semibold w-1/6">Status</th>
                                <th className="px-6 py-4 font-semibold w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-border/50">
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No employees found matching the filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        className={`hover:bg-muted/30 transition-colors group ${emp.status === "Offboarded" ? "opacity-80" : ""
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar Rendering */}
                                                <div
                                                    className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border border-border/50 flex items-center justify-center font-bold text-sm ${emp.status === "Offboarded"
                                                        ? "grayscale bg-muted"
                                                        : emp.status === "Onboarding"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : "bg-blue-100 text-blue-700"
                                                        }`}
                                                >
                                                    {emp.avatarUrl ? (
                                                        <img
                                                            src={emp.avatarUrl}
                                                            alt={emp.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        emp.initials
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{emp.name}</div>
                                                    <div className="text-xs text-muted-foreground">{emp.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            className={`px-6 py-4 text-muted-foreground ${emp.status === "Offboarded" ? "line-through decoration-border" : ""
                                                }`}
                                        >
                                            {emp.email}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={emp.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Shadcn Dropdown Menu for Actions */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <Link href={`/directory/${emp.id}`}>
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                            <Eye size={16} /> View Profile
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuSeparator />

                                                    {/* Conditional Action Buttons based on Status */}
                                                    {emp.status === "Active" && (
                                                        <OffboardingSheet>
                                                            {/* Cần e.preventDefault() để giữ Dropdown mở lúc Sheet kích hoạt */}
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            >
                                                                <UserMinus size={16} /> Trigger Offboard
                                                            </DropdownMenuItem>
                                                        </OffboardingSheet>
                                                    )}
                                                    {emp.status === "Onboarding" && (
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                                                            <XCircle size={16} /> Cancel Onboarding
                                                        </DropdownMenuItem>
                                                    )}
                                                    {emp.status === "Offboarded" && (
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-primary focus:text-primary">
                                                            <RefreshCcw size={16} /> Trigger Onboard
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Showing 1 to {filteredEmployees.length} of {filteredEmployees.length} entries
                    </span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                            <ChevronLeft size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Component phụ để render Badge Status với màu sắc chuẩn theo thiết kế
function StatusBadge({ status }: { status: Employee["status"] }) {
    if (status === "Active") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active
            </span>
        );
    }
    if (status === "Onboarding") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Onboarding
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Offboarded
        </span>
    );
}
