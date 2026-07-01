"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, ExternalLink, Link2 } from "lucide-react";

export interface IntegrationField {
    id: string;
    label: string;
    type: "text" | "password" | "url";
    placeholder?: string;
    defaultValue?: string;
}

export interface IntegrationPlatform {
    id: string;
    name: string;
    icon: ReactNode;
    description: string;
    authType: "oauth" | "credentials";
    fields?: IntegrationField[];
    scopes?: string[];
    docsUrl?: string;
}

interface IntegrationSetupModalProps {
    children: ReactNode;
    platform: IntegrationPlatform;
}

export function IntegrationSetupModal({ children, platform }: IntegrationSetupModalProps) {
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    const togglePassword = (fieldId: string) => {
        setShowPasswords((prev) => ({
            ...prev,
            [fieldId]: !prev[fieldId],
        }));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card">
                {/* Header (Tự động thay đổi Icon và Tên) */}
                <DialogHeader className="p-6 pb-4 border-b border-border text-left">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground border border-border shrink-0">
                            {platform.icon}
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-foreground">Configure {platform.name}</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {platform.description}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="p-6 flex flex-col gap-5 bg-background">

                    {platform.authType === "credentials" ? (
                        <>
                            {/* Connection Name chung */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="connection-name" className="text-sm font-medium text-foreground">
                                    Connection Name
                                </label>
                                <input
                                    id="connection-name"
                                    type="text"
                                    defaultValue={`My ${platform.name}`}
                                    className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                />
                            </div>

                            {/* Tự động render các trường nhập liệu tùy theo cấu hình */}
                            {platform.fields?.map((field) => (
                                <div key={field.id} className="flex flex-col gap-2">
                                    <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id={field.id}
                                            type={field.type === "password" && showPasswords[field.id] ? "text" : field.type}
                                            placeholder={field.placeholder}
                                            defaultValue={field.defaultValue}
                                            className="w-full pl-3 pr-10 py-2 bg-card border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                        />
                                        {field.type === "password" && (
                                            <button
                                                type="button"
                                                onClick={() => togglePassword(field.id)}
                                                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                                            >
                                                {showPasswords[field.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Scopes */}
                            {platform.scopes && (
                                <p className="text-[11px] leading-4 text-muted-foreground">
                                    Requires scopes: {platform.scopes.map((scope, idx) => (
                                        <span key={idx}>
                                            <code className="bg-muted px-1.5 py-0.5 rounded mr-1 text-foreground">{scope}</code>
                                        </span>
                                    ))}
                                </p>
                            )}
                        </>
                    ) : (
                        /* Layout dành cho chuẩn OAuth */
                        <div className="flex flex-col items-center text-center p-4 py-8 gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Link2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-foreground">OAuth Authentication</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-[300px]">
                                    You will be securely redirected to {platform.name} to grant ELA the necessary permissions.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Security Info Banner */}
                    <div className="mt-2 bg-muted/50 rounded-lg p-4 flex items-start gap-3 border border-border">
                        <Lock size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Security Note: Your API keys and tokens are encrypted at rest and never exposed to the client.
                            </p>
                            {platform.docsUrl && (
                                <a href={platform.docsUrl} className="text-sm font-medium text-primary hover:underline mt-1 inline-flex items-center gap-1">
                                    View {platform.name} setup guide <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="m-0 p-4 px-6 border-t border-border bg-card flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" className="shadow-sm">
                        {platform.authType === "oauth" ? `Connect ${platform.name}` : "Save & Test Connection"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}