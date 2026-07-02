"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, Workflow, Hash, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { IntegrationPlatform } from "./integration-setup-modal";

export interface IntegrationMappingData {
    id: string;
    department: string;
    resourceId: string;
    resourceName: string;
    resourceType: string;
}

export interface IntegrationData {
    id: string;
    provider: string;
    metadata: Record<string, unknown>;
    isActive: boolean;
    createdAt: string;
    mappings: IntegrationMappingData[];
}

interface IntegrationMappingsModalProps {
    children: ReactNode;
    integration: IntegrationData;
    platform: IntegrationPlatform;
    onUpdate: () => void;
}

const DEPARTMENTS = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations"
];

export function IntegrationMappingsModal({ children, integration, platform, onUpdate }: IntegrationMappingsModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [resources, setResources] = useState<{ id: string; name: string; type: string }[]>([]);

    // Form state
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedResource, setSelectedResource] = useState("");

    const fetchResources = useCallback(async () => {
        setIsLoadingResources(true);
        try {
            const res = await api.get(`/integrations/${integration.id}/resources`);
            if (res.ok) {
                const data = await res.json();
                setResources(data.data || []);
            } else {
                toast.error(`Failed to fetch ${platform.name} resources`);
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred fetching resources");
        } finally {
            setIsLoadingResources(false);
        }
    }, [integration.id, platform.name]);

    // Fetch resources when modal opens
    useEffect(() => {
        if (isOpen && integration) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchResources();
        }
    }, [isOpen, integration, fetchResources]);

    const handleAddMapping = async () => {
        if (!selectedDepartment || !selectedResource) return;

        const resourceObj = resources.find(r => r.id === selectedResource);
        if (!resourceObj) return;

        setIsSaving(true);
        try {
            const res = await api.post(`/integrations/${integration.id}/mappings`, {
                department: selectedDepartment,
                resourceId: resourceObj.id,
                resourceName: resourceObj.name,
                resourceType: resourceObj.type
            });

            if (res.ok) {
                toast.success("Mapping added successfully");
                setSelectedDepartment("");
                setSelectedResource("");
                onUpdate(); // Refresh parent data to get new mappings
            } else {
                const err = await res.json();
                toast.error(err.error?.message || "Failed to add mapping");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred while saving the mapping");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMapping = async (mappingId: string) => {
        try {
            const res = await api.delete(`/integrations/${integration.id}/mappings/${mappingId}`);
            if (res.ok) {
                toast.success("Mapping removed");
                onUpdate(); // Refresh parent data
            } else {
                toast.error("Failed to remove mapping");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred while removing the mapping");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden bg-card flex flex-col md:flex-row h-[600px] max-h-[90vh]">

                {/* Left Pane: Context (30%) */}
                <div className="hidden md:flex flex-col w-1/3 bg-slate-50 border-r border-border p-8">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-border flex items-center justify-center text-foreground mb-6">
                        {platform.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Resource Mapping</h2>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        Define rules to automatically assign resources when a new employee is onboarded.
                    </p>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Workflow size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600">
                                <strong className="font-medium text-slate-900 block mb-1">Department Logic</strong>
                                When an employee is assigned to a department, they will automatically be invited to the mapped {platform.name} resources.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Hash size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600">
                                <strong className="font-medium text-slate-900 block mb-1">Channels & Groups</strong>
                                You can map multiple departments to the same channel, but a department can only be mapped to a specific resource once.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Configuration (70%) */}
                <div className="flex flex-col flex-1 h-full bg-white">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Configure {platform.name} Rules</h3>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">

                        {/* New Mapping Form */}
                        <div className="bg-white rounded-xl border border-border p-5 mb-8 shadow-sm">
                            <h4 className="text-sm font-medium text-slate-900 mb-4">Create New Rule</h4>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="department" className="text-xs text-slate-600">If Department is...</Label>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button id="department" variant="outline" className="w-full justify-between font-normal h-10 bg-slate-50 border-border">
                                                {selectedDepartment || <span className="text-muted-foreground">Select department</span>}
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {DEPARTMENTS.map(dept => (
                                                <DropdownMenuItem key={dept} onSelect={() => setSelectedDepartment(dept)}>
                                                    {dept}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="resource" className="text-xs text-slate-600">Add to {platform.name} Resource...</Label>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild disabled={isLoadingResources}>
                                            <Button id="resource" variant="outline" className="w-full justify-between font-normal h-10 bg-slate-50 border-border">
                                                {isLoadingResources ? (
                                                    <span className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</span>
                                                ) : selectedResource ? (
                                                    resources.find(r => r.id === selectedResource)?.name
                                                ) : (
                                                    <span className="text-muted-foreground">Select resource</span>
                                                )}
                                                {!isLoadingResources && <ChevronDown className="h-4 w-4 opacity-50" />}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {resources.map(res => (
                                                <DropdownMenuItem key={res.id} onSelect={() => setSelectedResource(res.id)}>
                                                    {res.name} <span className="text-muted-foreground text-xs ml-1">({res.type})</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Button
                                    onClick={handleAddMapping}
                                    disabled={!selectedDepartment || !selectedResource || isSaving}
                                    className="h-10 px-6 shrink-0 bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Rule"}
                                </Button>
                            </div>
                        </div>

                        {/* Existing Mappings List */}
                        <div>
                            <h4 className="text-sm font-medium text-slate-900 mb-4 px-1">Active Rules</h4>

                            {!integration?.mappings || integration.mappings.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-border rounded-xl bg-white">
                                    <p className="text-sm text-slate-500">No mapping rules configured yet.</p>
                                </div>
                            ) : (
                                <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                                    {integration.mappings.map((mapping: IntegrationMappingData, idx: number) => (
                                        <div
                                            key={mapping.id}
                                            className={`flex items-center justify-between p-4 ${idx !== integration.mappings.length - 1 ? 'border-b border-border' : ''} hover:bg-slate-50 transition-colors`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-md border border-blue-100">
                                                    {mapping.department}
                                                </div>
                                                <div className="text-slate-400">→</div>
                                                <div className="flex items-center gap-2">
                                                    <Hash size={14} className="text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-900">{mapping.resourceName}</span>
                                                    <span className="text-[10px] uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{mapping.resourceType}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteMapping(mapping.id)}
                                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
