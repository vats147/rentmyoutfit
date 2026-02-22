"use client";

import { ReactNode } from "react";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Calendar,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Megaphone,
    Headset
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const DEV_USER_EMAIL = "vatsalmangukiya9003@gmail.com";

    useEffect(() => {
        if (!isLoading) {
            const isDev = user?.email === DEV_USER_EMAIL;
            const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'superadmin';

            if (isDev || isAdmin) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.push('/');
            }
        }
    }, [user, isLoading, router]);

    const menuItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ['admin', 'superadmin'] },
        { label: "Users", href: "/admin/users", icon: Users, roles: ['admin', 'superadmin'] },
        { label: "Listings", href: "/admin/listings", icon: ShoppingBag, roles: ['admin', 'superadmin'] },
        { label: "Bookings", href: "/admin/bookings", icon: Calendar, roles: ['admin', 'superadmin', 'support'] },
        { label: "Marketing", href: "/admin/marketing", icon: Megaphone, roles: ['admin', 'superadmin', 'marketing'] },
        { label: "Support", href: "/admin/support", icon: Headset, roles: ['admin', 'superadmin', 'support'] },
        { label: "Security", href: "/admin/security", icon: ShieldCheck, roles: ['admin', 'superadmin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (user?.email === DEV_USER_EMAIL) return true;
        const userRole = (user as any)?.role;
        return item.roles.includes(userRole);
    });

    if (isLoading || isAuthorized === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    if (isAuthorized === false) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-primary text-white flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center text-brand-primary font-bold">SR</div>
                        <span className="font-bold text-xl tracking-tight">Admin<span className="text-brand-gold">Panel</span></span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {filteredMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all ${isActive
                                    ? "bg-brand-gold text-brand-primary font-bold shadow-lg shadow-brand-gold/20"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button className="flex items-center gap-3 p-3 text-white/70 hover:text-white transition-colors w-full text-left">
                        <LogOut className="w-5 h-5 text-brand-gold" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
