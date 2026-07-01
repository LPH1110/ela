"use client";

import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Cat,
    CheckSquare,
    Briefcase,
    MessageCircle,
    Plus,
    Settings,
    RefreshCw,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { IntegrationSetupModal, IntegrationPlatform } from "@/components/modals/integration-setup-modal";

// --- KHAI BÁO CẤU HÌNH CHO TỪNG NỀN TẢNG ---
const platformConfigs: Record<string, IntegrationPlatform> = {
    github: {
        id: "github",
        name: "GitHub",
        icon: <Cat size={24} />,
        description: "Connect GitHub to automate organization invites and manage repository access.",
        authType: "credentials",
        docsUrl: "#github-docs",
        scopes: ["repo", "admin:org", "user"],
        fields: [
            { id: "pat", label: "Personal Access Token (PAT)", type: "password", placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx" }
        ]
    },
    slack: {
        id: "slack",
        name: "Slack Enterprise",
        icon: <MessageSquare size={24} />,
        description: "Integrate Slack to provision accounts and send onboarding welcome messages.",
        authType: "oauth", // Slack thường dùng OAuth 1-click
        docsUrl: "#slack-docs"
    },
    google: {
        id: "google",
        name: "Google Workspace",
        icon: <Briefcase size={24} />,
        description: "Automate Gmail, Google Drive, and organizational unit (OU) assignments.",
        authType: "oauth", // Google Workspace thường dùng OAuth Domain-Wide Delegation
        docsUrl: "#google-docs"
    },
    jira: {
        id: "jira",
        name: "Jira Software",
        icon: <CheckSquare size={24} />,
        description: "Manage Jira project access and issue assignment upon onboarding.",
        authType: "credentials",
        docsUrl: "#jira-docs",
        fields: [
            { id: "domain", label: "Workspace URL", type: "url", placeholder: "https://your-company.atlassian.net" },
            { id: "email", label: "Admin Email", type: "text", placeholder: "admin@your-company.com" },
            { id: "api_token", label: "Jira API Token", type: "password", placeholder: "ATATT3xFfGF0..." }
        ]
    },
    zalo: {
        id: "zalo",
        name: "Zalo Official Account",
        icon: <MessageCircle size={24} />, // Lucide không có Zalo, dùng tạm MessageCircle
        description: "Connect Zalo ZNS to send automated notifications to employees via Zalo.",
        authType: "credentials",
        docsUrl: "#zalo-docs",
        fields: [
            { id: "oa_id", label: "Official Account ID", type: "text", placeholder: "1234567890" },
            { id: "access_token", label: "Zalo Access Token", type: "password", placeholder: "eyJhbGciOiJIUzI1NiIs..." }
        ]
    }
};

// Dữ liệu mô phỏng cho danh sách
const activeIntegrations = [
    { id: "slack", status: "Connected", lastSync: "2 mins ago" },
    { id: "google", status: "Connected", lastSync: "10 mins ago" },
    { id: "github", status: "Connected", lastSync: "1 hour ago" },
    { id: "jira", status: "Error", lastSync: "Failed 2 hours ago" },
    { id: "zalo", status: "Disconnected", lastSync: "Never" },
];

export default function IntegrationsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                        Integrations
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Connect and manage third-party applications for lifecycle automation.
                    </p>
                </div>
                <Button className="flex items-center gap-2 px-5 py-5 rounded-lg shadow-sm">
                    <Plus size={18} />
                    Add Integration
                </Button>
            </div>

            {/* Grid Danh sách nền tảng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeIntegrations.map((item) => {
                    const config = platformConfigs[item.id]; // Lấy cấu hình chuẩn từ ID

                    return (
                        <div key={item.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-foreground group-hover:bg-background transition-colors">
                                    {config.icon}
                                </div>
                                <IntegrationStatus status={item.status as any} />
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-foreground">{config.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{config.description}</p>
                            </div>

                            <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <RefreshCw size={12} className={item.status === "Connected" ? "" : "opacity-50"} />
                                    {item.lastSync}
                                </div>
                                <div className="flex gap-2">

                                    {item.status === "Connected" ? (
                                        <>
                                            {/* Truyền config tương ứng vào Modal để sửa cấu hình */}
                                            <IntegrationSetupModal platform={config}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Settings size={16} />
                                                </Button>
                                            </IntegrationSetupModal>

                                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                                Sync
                                            </Button>
                                        </>
                                    ) : (
                                        /* Truyền config tương ứng vào Modal để tạo mới kết nối */
                                        <IntegrationSetupModal platform={config}>
                                            <Button variant="default" size="sm" className="h-8 text-xs">
                                                Connect
                                            </Button>
                                        </IntegrationSetupModal>
                                    )}

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function IntegrationStatus({ status }: { status: "Connected" | "Disconnected" | "Error" }) {
    if (status === "Connected") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[11px] font-medium dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Connected
            </span>
        );
    }
    if (status === "Error") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-medium">
                <AlertCircle size={12} /> Sync Error
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border text-[11px] font-medium">
            Disconnected
        </span>
    );
}