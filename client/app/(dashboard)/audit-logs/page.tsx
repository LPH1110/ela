"use client";

import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Calendar,
    Cat,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Cloud,
    Filter,
    MessageSquare,
    RefreshCw,
    Search
} from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Briefcase, CheckSquare, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";

export default function AuditLogsPage() {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange>({});

    const toggleRow = (id: string) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/orgs/audit-logs?limit=100');
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data.data || []);
                }
            } catch (error) {
                console.error("Failed to load audit logs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getProviderIcon = (provider: string) => {
        switch (provider.toUpperCase()) {
            case 'GITHUB': return <Cat size={16} />;
            case 'SLACK': return <MessageSquare size={16} />;
            case 'GOOGLE': return <Briefcase size={16} />;
            case 'JIRA': return <CheckSquare size={16} />;
            case 'ZALO': return <MessageCircle size={16} />;
            default: return <Cloud size={16} />;
        }
    };

    const getProviderName = (provider: string) => {
        switch (provider.toUpperCase()) {
            case 'GITHUB': return "GitHub";
            case 'SLACK': return "Slack";
            case 'GOOGLE': return "Google Workspace";
            case 'JIRA': return "Jira";
            case 'ZALO': return "Zalo";
            default: return provider;
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
                    <ChevronRight size={14} />
                    <span className="text-foreground font-medium">Audit Logs</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Execution History</h2>
                <p className="text-sm text-muted-foreground">Monitor administrative actions and integration events across the lifecycle.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Search by employee name or ID..."
                        type="text"
                    />
                </div>
                <div className="relative min-w-[160px]">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between bg-background border-input font-normal h-[38px] px-3">
                                <span className="capitalize">{statusFilter === 'all' ? 'All Statuses' : statusFilter}</span>
                                <ChevronDown size={16} className="opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            <DropdownMenuItem onSelect={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setStatusFilter("success")}>Success</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setStatusFilter("processing")}>Processing</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="relative min-w-[240px]">
                    <DateRangePicker 
                        value={dateRange} 
                        onChange={setDateRange} 
                        className="h-[38px]"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} /> Filters
                </Button>
            </div>

            {/* Data Table Container */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                <th className="py-3 px-4 w-12"></th>
                                <th className="py-3 px-4">Timestamp</th>
                                <th className="py-3 px-4">Employee</th>
                                <th className="py-3 px-4">Target App</th>
                                <th className="py-3 px-4">Action</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No logs found.</td></tr>
                            ) : logs.map((log) => {
                                const isExpanded = expandedRows.includes(log.id);
                                const hasError = log.status === "FAILED";
                                
                                const nameParts = log.employee?.fullName?.trim().split(/\s+/) || [];
                                const initials = nameParts.length > 0 
                                    ? nameParts.map((part: string) => part[0]).join("").toUpperCase().slice(0, 2)
                                    : "EE";

                                return (
                                    <Fragment key={log.id}>
                                        {/* Main Row */}
                                        <tr
                                            className={`hover:bg-muted/30 transition-colors group ${hasError ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-muted/30' : ''}`}
                                            onClick={() => hasError && toggleRow(log.id)}
                                        >
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {hasError && (
                                                    <button className="p-1 hover:bg-muted rounded transition-colors">
                                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center text-xs font-medium">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{log.employee?.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">{log.employee?.personalEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background text-xs font-medium">
                                                    {getProviderIcon(log.provider)} {getProviderName(log.provider)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-xs bg-muted text-foreground px-2 py-0.5 rounded border border-border/50">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={log.status as any} />
                                            </td>
                                        </tr>

                                        {/* Expanded Error Details Row */}
                                        {isExpanded && hasError && (
                                            <tr className="bg-muted/10 border-b border-border">
                                                <td colSpan={6} className="p-0">
                                                    <div className="p-6 ml-12">
                                                        <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                                            Error Details
                                                        </div>
                                                        <div className="bg-zinc-950 text-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-inner border border-zinc-800">
                                                            <pre><code>{log.message || "Unknown Error"}</code></pre>
                                                        </div>
                                                        <div className="mt-4 flex gap-3">
                                                            <Button className="h-8 text-xs">Retry Action</Button>
                                                            <Button variant="outline" className="h-8 text-xs">Copy Details</Button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-border bg-card p-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">{logs.length}</span> of <span className="font-medium text-foreground">{logs.length}</span> results
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Status Badge Component cho Audit Logs
function StatusBadge({ status }: { status: "Success" | "Failed" | "Processing" }) {
    if (status === "Success") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-xs font-medium dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Success
            </span>
        );
    }
    if (status === "Failed") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
                <AlertCircle size={14} /> Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-muted-foreground text-xs font-medium">
            <RefreshCw size={14} className="animate-spin" /> Processing
        </span>
    );
}