"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-background border-b border-border sticky top-0 z-40 flex justify-between md:justify-end items-center h-16 px-6">
            <div className="md:hidden flex items-center">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1 -ml-2 rounded-md">
                            <Menu size={24} />
                            <span className="sr-only">Toggle mobile menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-4 pt-6 flex flex-col gap-0 border-r border-border" showCloseButton={false}>
                        <SidebarContent onNavClick={() => setMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-muted-foreground hover:text-primary transition-colors relative">
                    <Bell size={22} />
                    <span className="absolute top-0 right-0.5 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
                <div className="w-8 h-8 rounded-full border border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrnbnh6sJXXInKyPCKFvT3KWpf1GuN2SBZOqBcd38yYuY9sX6dxEuGvbo-fAI3wVzePshD8LNRzhOHFXnPxproqOUDuoet8XPL_Do9jx7BFwTroJ3vTe3m75ksZ8N51m_GvXVLJ6od2-R3QoEKqveDi4Mu3LE_JWANI7kKiprsB8ngr1eecW-Atv10XxgTuqBjk6aNmzNMYZQdIm2a3WqMxTejqZyJFyPCZExDCKzUCG4B6yPcgDZyZdVfrogkNJ0Z5aLF352md-2j"
                        alt="Admin Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}