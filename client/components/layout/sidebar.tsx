import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Network,
    ScrollText,
    Settings,
    UserCircle,
    Hexagon
} from "lucide-react";
import Logo from "./logo";

export default function Sidebar() {
    return (
        <nav className="w-[280px] h-full fixed left-0 top-0 bg-background border-r border-border hidden md:flex flex-col py-6 px-4 z-50">
            <Logo />

            <div className="flex flex-col gap-1 flex-1">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium transition-colors">
                    <LayoutDashboard size={20} />
                    <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link href="/directory" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted transition-colors rounded-lg group">
                    <Users size={20} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm">Directory</span>
                </Link>
                <Link href="/integrations" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted transition-colors rounded-lg group">
                    <Network size={20} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm">Integrations</span>
                </Link>
                <Link href="/audit-logs" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted transition-colors rounded-lg group">
                    <ScrollText size={20} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm">Audit Logs</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted transition-colors rounded-lg group">
                    <Settings size={20} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm">Settings</span>
                </Link>
            </div>

            <div className="mt-auto pt-4 border-t border-border">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted transition-colors rounded-lg group">
                    <UserCircle size={20} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm">User Profile</span>
                </Link>
            </div>
        </nav>
    );
}