"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
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
import { IntegrationMappingsModal } from "@/components/modals/integration-mappings-modal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface IntegrationData {
    id: string;
    provider: string;
    metadata: Record<string, unknown>;
    isActive: boolean;
    createdAt: string;
    mappings: Array<{
        id: string;
        department: string;
        resourceId: string;
        resourceName: string;
        resourceType: string;
    }>;
}

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

export default function IntegrationsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading integrations...</div>}>
            <IntegrationsContent />
        </Suspense>
    );
}

function IntegrationsContent() {
    const [loading, setLoading] = useState(true);
    const [activeIntegrations, setActiveIntegrations] = useState<IntegrationData[]>([]);
    const searchParams = useSearchParams();

    // Check for OAuth callbacks
    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'slack') {
            toast.success("Slack successfully connected!");
            // Clean up the URL
            window.history.replaceState({}, document.title, "/integrations");
        }

        if (error) {
            toast.error("Failed to connect integration: " + error);
            window.history.replaceState({}, document.title, "/integrations");
        }
    }, [searchParams]);

    const fetchIntegrations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/integrations');
            if (res.ok) {
                const json = await res.json();
                setActiveIntegrations(json.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch integrations", e);
            toast.error("Failed to load integrations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const handleDisconnect = async (id: string) => {
        try {
            const res = await api.delete(`/integrations/${id}`);
            if (res.ok) {
                toast.success("Integration disconnected successfully");
                fetchIntegrations();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error?.message || "Failed to disconnect integration");
            }
        } catch (e) {
            console.error(e);
            toast.error("An unexpected error occurred");
        }
    };

    // Helper to find the actual backend integration for a platform config
    const getBackendIntegration = (platformId: string) => {
        return activeIntegrations.find(i => i.provider.toLowerCase() === platformId.toLowerCase());
    };

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
                {Object.values(platformConfigs).map((config) => {
                    const backendData = getBackendIntegration(config.id);
                    const status = backendData ? "Connected" : "Disconnected";

                    return (
                        <div key={config.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-foreground group-hover:bg-background transition-colors">
                                    {config.icon}
                                </div>
                                <IntegrationStatus status={status as "Connected" | "Disconnected"} />
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-foreground">{config.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{config.description}</p>
                            </div>

                            <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <RefreshCw size={12} className={status === "Connected" ? "" : "opacity-50"} />
                                    {status === "Connected" && backendData?.createdAt ? new Date(backendData.createdAt).toLocaleDateString() : "Never"}
                                </div>
                                <div className="flex gap-2">

                                    {backendData ? (
                                        <>
                                            <IntegrationMappingsModal integration={backendData} platform={config} onUpdate={fetchIntegrations}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Settings size={16} />
                                                </Button>
                                            </IntegrationMappingsModal>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                                        Disconnect
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="sm:max-w-[425px]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Disconnect {config.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will remove the integration and delete all associated mappings. Any pending tasks for this provider will be canceled. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDisconnect(backendData.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Disconnect
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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