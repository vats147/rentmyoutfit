"use client";

import { useEffect, useState } from "react";
import {
    Users,
    ShoppingBag,
    Calendar,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    totalListings: number;
    totalBookings: number;
    revenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking the stats for now until auth is fully piped through
        setTimeout(() => {
            setStats({
                totalUsers: 1250,
                totalListings: 450,
                totalBookings: 890,
                revenue: 125000
            });
            setLoading(false);
        }, 1000);
    }, []);

    const statsCards = [
        { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
        { label: "Active Listings", value: stats?.totalListings, icon: ShoppingBag, color: "bg-green-50 text-green-600" },
        { label: "Total Bookings", value: stats?.totalBookings, icon: Calendar, color: "bg-purple-50 text-purple-600" },
        { label: "Platform Revenue", value: `₹${stats?.revenue?.toLocaleString()}`, icon: TrendingUp, color: "bg-brand-gold/10 text-brand-gold" },
    ];

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-50">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Admin Dashboard</h1>
                    <p className="text-slate-500">Welcome back, Platform Administrator</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                        Security Logs
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                        Download Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, i) => (
                        <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${card.color}`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <span className="text-green-500 text-xs font-bold">+12%</span>
                            </div>
                            <p className="text-slate-500 text-sm mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                        <Link href="/admin/activity" className="text-brand-primary text-sm font-medium flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-4 border-brand-gold">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">New high-value listing approved</p>
                                    <p className="text-xs text-slate-500">Bridal Lehenga Collection #8921 • 5 mins ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Pending Actions</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-amber-500 w-5 h-5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-900">KYC Verifications</p>
                                    <p className="text-xs text-amber-700">12 sellers waiting for approval</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-white border border-amber-200 text-amber-700 rounded text-xs font-bold hover:bg-amber-100">Review</button>
                        </div>
                        {/* Additional pending items */}
                    </div>
                </div>
            </div>
        </div>
    );
}
