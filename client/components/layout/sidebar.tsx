"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Network,
    ScrollText,
    Settings,
    UserCircle
} from "lucide-react";
import Logo from "./logo";
import { cn } from "@/lib/utils";

export function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
    const pathname = usePathname() || "";

    const getLinkClass = (href: string) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group select-none",
            isActive
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        );
    };

    const getIconClass = (href: string) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return cn(
            "transition-colors duration-200",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        );
    };

    return (
        <>
            <div className="mb-6 px-2">
                <Logo />
            </div>

            <div className="flex flex-col gap-1 flex-1">
                <Link href="/" className={getLinkClass("/")} onClick={onNavClick}>
                    <LayoutDashboard size={20} className={getIconClass("/")} />
                    <span className="text-sm">Dashboard</span>
                </Link>
                <Link href="/directory" className={getLinkClass("/directory")} onClick={onNavClick}>
                    <Users size={20} className={getIconClass("/directory")} />
                    <span className="text-sm">Directory</span>
                </Link>
                <Link href="/integrations" className={getLinkClass("/integrations")} onClick={onNavClick}>
                    <Network size={20} className={getIconClass("/integrations")} />
                    <span className="text-sm">Integrations</span>
                </Link>
                <Link href="/audit-logs" className={getLinkClass("/audit-logs")} onClick={onNavClick}>
                    <ScrollText size={20} className={getIconClass("/audit-logs")} />
                    <span className="text-sm">Audit Logs</span>
                </Link>
                <Link href="/settings" className={getLinkClass("/settings")} onClick={onNavClick}>
                    <Settings size={20} className={getIconClass("/settings")} />
                    <span className="text-sm">Settings</span>
                </Link>
            </div>

            <div className="mt-auto pt-4 border-t border-border">
                <Link href="/profile" className={getLinkClass("/profile")} onClick={onNavClick}>
                    <UserCircle size={20} className={getIconClass("/profile")} />
                    <span className="text-sm">User Profile</span>
                </Link>
            </div>
        </>
    );
}

export default function Sidebar() {
    return (
        <nav className="w-[280px] h-full fixed left-0 top-0 bg-background border-r border-border hidden md:flex flex-col py-6 px-4 z-50">
            <SidebarContent />
        </nav>
    );
}