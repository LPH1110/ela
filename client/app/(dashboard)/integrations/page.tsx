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
    AlertCircle,
    ExternalLink
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

// platformConfigs will be fetched from the backend dynamically

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
    const [catalog, setCatalog] = useState<Record<string, IntegrationPlatform>>({});
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const searchParams = useSearchParams();

    const getProviderIcon = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'github': return <Cat size={24} />;
            case 'slack': return <MessageSquare size={24} />;
            case 'google': return <Briefcase size={24} />;
            case 'jira': return <CheckSquare size={24} />;
            case 'zalo': return <MessageCircle size={24} />;
            default: return <MessageSquare size={24} />;
        }
    };

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
            const [integrationsRes, catalogRes] = await Promise.all([
                api.get('/integrations'),
                api.get('/integrations/catalog')
            ]);
            
            if (integrationsRes.ok) {
                const json = await integrationsRes.json();
                setActiveIntegrations(json.data || []);
            }

            if (catalogRes.ok) {
                const catalogJson = await catalogRes.json();
                const catalogData = catalogJson.data || {};
                
                // Map backend catalog to frontend format with icons
                const mappedCatalog: Record<string, IntegrationPlatform> = {};
                for (const key in catalogData) {
                    mappedCatalog[key] = {
                        ...catalogData[key],
                        icon: getProviderIcon(key)
                    };
                }
                setCatalog(mappedCatalog);
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

    const handleSync = async (id: string) => {
        setIsSyncing(id);
        try {
            const res = await api.post(`/integrations/${id}/sync`);
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "Sync started successfully");
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error?.message || "Failed to start sync");
            }
        } catch (e) {
            console.error(e);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSyncing(null);
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
                {Object.values(catalog).map((config) => {
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
                                {backendData?.metadata?.teamName ? (
                                    <div className="mt-1 flex flex-col gap-1">
                                        <p className="text-sm text-muted-foreground line-clamp-1">{config.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[13px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-900/50 inline-flex items-center gap-1.5">
                                                Workspace: 
                                                {backendData.metadata.teamUrl ? (
                                                    <a href={backendData.metadata.teamUrl as string} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                        {backendData.metadata.teamName as string}
                                                        <ExternalLink size={12} className="opacity-70" />
                                                    </a>
                                                ) : (
                                                    backendData.metadata.teamName as string
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{config.description}</p>
                                )}
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
                                                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled={isSyncing === backendData.id}>
                                                        {isSyncing === backendData.id ? (
                                                            <RefreshCw size={14} className="mr-1 animate-spin" />
                                                        ) : (
                                                            <RefreshCw size={14} className="mr-1" />
                                                        )}
                                                        Sync
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="sm:max-w-[425px]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Sync {config.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will manually attempt to invite all existing active employees to the mapped channels in this workspace. This happens in the background. Are you sure you want to proceed?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleSync(backendData.id)}
                                                        >
                                                            Start Sync
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive hover:text-background">
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