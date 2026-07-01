"use client";

import { useState } from "react";
import { Bell, Menu, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

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

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-8 h-8 rounded-full border border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all flex items-center justify-center bg-muted">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-medium text-muted-foreground">{getInitials(user.fullName)}</span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-foreground">{user.fullName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}