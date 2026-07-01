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
import { Fragment, useState } from "react";

// Định nghĩa dữ liệu mẫu dựa trên HTML
const auditLogs = [
    {
        id: "log-001",
        timestamp: "2023-10-17 09:41:22",
        employee: { name: "Sarah Jenkins", email: "s.jenkins@kinetic.io", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDeqPnR6V6S0TEec22HZ5Q8SlcTs09bCKwaTSci5Q7pc00DkcvEUrSheSWz19L4Nfg7jKNvsPMr7_6P9PAxcUXEg_l6PPiw_y0mcVmGxwaG8BdQIM9T18PbRjdnEQr8gPWSL9u0Vq4shJic4XfnJO-uRZCmLSgO9vN6OWbnc9Z358aY3r1ql6T5xIH7QH-3bRLeKtWy9cRmn9iCGd9Q__ChzDwtnxnuuJwEPAOK8wuj0OuMwDqq2ze5V80t19uYlRKvKaB__Zw9BQdx" },
        app: { name: "Cat", icon: <Cat size={16} /> },
        action: "CREATE_ACCOUNT",
        status: "Success",
    },
    {
        id: "err-124",
        timestamp: "2023-10-17 09:38:05",
        employee: { name: "Marcus Chen", email: "m.chen@kinetic.io", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcDH2t2vmqUsE4B4wyygC7Vi-RgdDfohqZDF4XD9OJYTKGl9MRCkwzeHeevUtr8ScqV-LSe498BpCMlN1hrhopMG22uqTJ9Y3NY8CIeKfP47qzMim7xg2RttJsXps8fAkKcHMuL3GaiqhdAhKXH_hL5esiUYF9FhabFPJBWmWE-mFMmHJYKueCvaRODx9nfGuH-Hnu3DJq6AGUFG8NB9aUixQla5KF0NQ8ga3gJyEA7wvorMTHaVJxoDWMTI6Y3Cz9GvpMEANpssXv" },
        app: { name: "Slack", icon: <MessageSquare size={16} /> },
        action: "REVOKE_ACCESS",
        status: "Failed",
        errorPayload: `{
  "timestamp": "2023-10-17T13:38:05.124Z",
  "action": "REVOKE_ACCESS",
  "target_system": "slack_enterprise",
  "user_id": "usr_9982a1b",
  "error": {
    "code": "API_RATE_LIMIT_EXCEEDED",
    "message": "Slack API rejected the request due to rate limiting on the admin.users.remove endpoint.",
    "retry_after": 120
  },
  "correlation_id": "req_55b3-9092-11a2"
}`,
    },
    {
        id: "log-003",
        timestamp: "2023-10-17 09:35:11",
        employee: { name: "Elena Jenkins", email: "e.jenkins@kinetic.io", initials: "EJ" },
        app: { name: "AWS IAM", icon: <Cloud size={16} /> },
        action: "UPDATE_POLICIES",
        status: "Processing",
    },
];

export default function AuditLogsPage() {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const toggleRow = (id: string) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
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
                    <select className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
                        <option value="all">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="processing">Processing</option>
                    </select>
                </div>
                <div className="relative min-w-[200px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        defaultValue="Oct 10 - Oct 17, 2023"
                        readOnly
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
                            {auditLogs.map((log) => {
                                const isExpanded = expandedRows.includes(log.id);
                                const hasError = log.status === "Failed";

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
                                            <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{log.timestamp}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center text-xs font-medium">
                                                        {log.employee.avatar ? (
                                                            <img src={log.employee.avatar} alt={log.employee.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            log.employee.initials
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{log.employee.name}</div>
                                                        <div className="text-xs text-muted-foreground">{log.employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background text-xs font-medium">
                                                    {log.app.icon} {log.app.name}
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
                                                            Error Details Payload
                                                        </div>
                                                        <div className="bg-zinc-950 text-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-inner border border-zinc-800">
                                                            <pre><code>{log.errorPayload}</code></pre>
                                                        </div>
                                                        <div className="mt-4 flex gap-3">
                                                            <Button className="h-8 text-xs">Retry Action</Button>
                                                            <Button variant="outline" className="h-8 text-xs">Copy Payload</Button>
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
                        Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of <span className="font-medium text-foreground">97</span> results
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
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