"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import {
    ChevronRight,
    Edit2,
    UserX,
    MapPin,
    MessageSquare,
    Code,
    CheckSquare,
    Mail,
    History,
    CheckCircle2,
    Network,
    Play,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import OffboardingSheet from "@/components/modals/offboarding-sheet";

type JobLog = {
    id: string;
    action: string;
    status: string;
    createdAt: string;
};

type Employee = {
    id: string;
    fullName: string;
    personalEmail: string;
    companyEmail?: string;
    department: string;
    status: string;
    createdAt: string;
    jobLogs: JobLog[];
};

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployee = async () => {
        try {
            const res = await api.get(`/employees/${id}`);
            if (!res.ok) {
                if (res.status === 404) router.push("/directory");
                return;
            }
            const json = await res.json();
            setEmployee(json.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchIntegrations = async () => {
        try {
            const res = await api.get('/integrations');
            if (res.ok) {
                const json = await res.json();
                setIntegrations(json.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch integrations", e);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchEmployee(), fetchIntegrations()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [id, router]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading employee data...</div>;
    }

    if (!employee) {
        return <div className="p-8 text-center text-destructive">Employee not found</div>;
    }

    // Derive dynamic values
    const hireDateObj = new Date(employee.createdAt);
    const msInYear = 1000 * 60 * 60 * 24 * 365.25;
    const tenureYears = ((Date.now() - hireDateObj.getTime()) / msInYear).toFixed(1);
    const tenure = `${tenureYears}y`;

    // Placeholders for fields not currently returned by backend API
    const performance = "N/A";
    const stockOps = "N/A";
    const phoneNumber = "N/A";
    const location = "N/A";
    const reportsTo = "N/A";

    const nameParts = employee.fullName.trim().split(/\s+/);
    const initials = nameParts.length > 0 ? nameParts.map(part => part[0]).join("").toUpperCase().slice(0, 2) : "EE";

    const formattedHireDate = new Date(employee.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const isOffboarded = employee.status === "OFFBOARDED";

    return (
        <div>
            {/* Page Header / Breadcrumbs */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/directory" className="hover:text-primary transition-colors">Directory</Link>
                        <ChevronRight size={14} />
                        <span className="text-foreground font-semibold">{employee.fullName}</span>
                    </nav>
                    <h2 className="text-3xl font-bold text-foreground">Employee Profile</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Edit2 size={16} /> Edit Profile
                    </Button>
                    {!isOffboarded && (
                        <OffboardingSheet 
                            employee={{ 
                                id: employee.id, 
                                name: employee.fullName, 
                                email: employee.personalEmail, 
                                department: employee.department, 
                                initials 
                            }}
                            onSuccess={fetchEmployee}
                        >
                            <Button variant="destructive" className="flex items-center gap-2">
                                <UserX size={16} /> Trigger Offboarding
                            </Button>
                        </OffboardingSheet>
                    )}
                </div>
            </div>

            {/* Bento Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Profile & Details */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Profile Card */}
                    <section className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center shadow-sm">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full border-4 border-background shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                                {initials}
                            </div>
                            <div className={`absolute bottom-1 right-1 w-6 h-6 border-2 border-background rounded-full ${isOffboarded ? 'bg-zinc-400' : 'bg-emerald-500'}`} title={employee.status}></div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{employee.fullName}</h3>
                        <p className="text-lg font-medium text-primary mb-2">Senior Frontend Engineer</p>
                        <div className="flex items-center justify-center gap-2 mb-6 text-xs font-medium text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded-md">EMP-{(employee.id.slice(0, 4)).toUpperCase()}</span>
                            <span className="w-1 h-1 rounded-full bg-border"></span>
                            <span>{employee.department}</span>
                        </div>
                        <div className="w-full grid grid-cols-3 border-t border-border pt-6">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Performance</p>
                                <p className="text-lg font-bold text-foreground">{performance}</p>
                            </div>
                            <div className="border-x border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Tenure</p>
                                <p className="text-lg font-bold text-foreground">{tenure}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Stock Ops</p>
                                <p className="text-lg font-bold text-foreground">{stockOps}</p>
                            </div>
                        </div>
                    </section>

                    {/* Personal Details Card */}
                    <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h4 className="text-lg font-medium text-foreground">Personal Details</h4>
                            <Info size={18} className="text-muted-foreground" />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Email Address</span>
                                <span className="text-sm font-medium text-foreground">{employee.companyEmail || employee.personalEmail}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
                                <span className="text-sm font-medium text-foreground">{phoneNumber}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Hire Date</span>
                                <span className="text-sm font-medium text-foreground">{formattedHireDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Location</span>
                                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    <MapPin size={16} className="text-muted-foreground" />
                                    {location}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Reports To</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                        N/A
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{reportsTo}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: System Access & History */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Managed Accounts Card */}
                    <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h4 className="text-lg font-medium text-foreground">Managed Accounts</h4>
                            <button className="text-xs font-medium text-primary hover:underline cursor-pointer">Manage Access</button>
                        </div>
                        <div className="divide-y divide-border/50">
                            {integrations.length === 0 ? (
                                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No integrations connected yet.
                                </div>
                            ) : (
                                integrations.map((integration) => {
                                    // Map provider to specific UI details
                                    let Icon = Network;
                                    let name = integration.provider;
                                    let handle = employee.companyEmail || employee.personalEmail;
                                    
                                    if (integration.provider === "SLACK") {
                                        Icon = MessageSquare;
                                        name = "Slack";
                                        handle = "@" + employee.fullName.split(" ")[0].toLowerCase();
                                    } else if (integration.provider === "GITHUB") {
                                        Icon = Code;
                                        name = "GitHub";
                                        handle = employee.fullName.split(" ")[0].toLowerCase() + "-dev";
                                    }
                                    
                                    let statusText = "Active";
                                    let bgClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
                                    
                                    if (isOffboarded) {
                                        statusText = "Revoked";
                                        bgClass = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
                                    } else if (employee.status === "ONBOARDING") {
                                        statusText = "Provisioning";
                                        bgClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
                                    } else if (integration.metadata?.teamName) {
                                        // Include team name context for active employees
                                        statusText = `Active in ${integration.metadata.teamName}`;
                                    }

                                    return (
                                        <div key={integration.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border/50 group-hover:border-primary group-hover:text-primary transition-colors text-muted-foreground">
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{name}</p>
                                                    <p className="text-xs font-medium text-muted-foreground">{handle}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-[11px] font-bold uppercase rounded-md ${bgClass}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Lifecycle Timeline Card */}
                    <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h4 className="text-lg font-medium text-foreground">Lifecycle Timeline</h4>
                            <History size={18} className="text-muted-foreground" />
                        </div>
                        <div className="p-6">
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-primary before:via-border before:to-transparent">

                                {/* Dynamic Job Logs */}
                                {employee.jobLogs && employee.jobLogs.length > 0 ? (
                                    employee.jobLogs.map((log, i) => (
                                        <div key={log.id} className="relative flex items-start gap-6">
                                            <div className={`absolute left-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow-sm z-10 ${log.status === 'SUCCESS' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                {log.status === 'SUCCESS' ? <CheckCircle2 size={18} /> : <Play size={18} />}
                                            </div>
                                            <div className="pl-12">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-semibold text-foreground">{log.action}</p>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        • {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground capitalize">Status: {log.status.toLowerCase()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                        <div className="p-4 text-sm text-muted-foreground italic">
                                            No lifecycle events recorded yet.
                                        </div>
                                )}
                            </div>

                            <div className="mt-8 pt-4 border-t border-border text-center">
                                <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">View Full Audit Log</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
