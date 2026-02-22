"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    ShieldAlert,
    UserCheck,
    Mail,
    Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

interface User {
    id: string;
    displayName: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    kycStatus: string;
    isBanned: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking for now - will connect to real /api/admin/users
        setTimeout(() => {
            setUsers([
                {
                    id: "1",
                    displayName: "Rahul Mehta",
                    email: "rahul@example.com",
                    phone: "+91 9876543210",
                    role: "admin",
                    kycStatus: "verified",
                    isBanned: false,
                    createdAt: "2024-01-10T10:00:00Z"
                },
                {
                    id: "2",
                    displayName: "Sanya Patel",
                    email: "sanya@example.com",
                    phone: "+91 8765432109",
                    role: "seller",
                    kycStatus: "pending",
                    isBanned: false,
                    createdAt: "2024-02-15T12:30:00Z"
                },
                {
                    id: "3",
                    displayName: "Amit Shah",
                    email: "amit@example.com",
                    phone: "+91 7654321098",
                    role: "customer",
                    kycStatus: "rejected",
                    isBanned: true,
                    createdAt: "2024-03-01T08:15:00Z"
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="p-8 space-y-6 min-h-screen bg-slate-50 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-primary">User Management</h1>
                    <p className="text-slate-500 text-sm">Monitor and moderate registered platform users</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">User</TableHead>
                            <TableHead className="font-bold text-slate-700">Role</TableHead>
                            <TableHead className="font-bold text-slate-700">KYC Status</TableHead>
                            <TableHead className="font-bold text-slate-700">Joined</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5} className="h-16 animate-pulse bg-slate-50/50" />
                                </TableRow>
                            ))
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                                                {user.displayName?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 flex items-center gap-1">
                                                    {user.displayName || "Anonymous"}
                                                    {user.isBanned && <ShieldAlert className="w-3 h-3 text-red-500" />}
                                                </p>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {user.email || "N/A"}</span>
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {user.phone || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'seller' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`capitalize font-bold text-[10px] ${user.kycStatus === 'verified' ? 'bg-green-100 text-green-700 border-green-200' :
                                                user.kycStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                            }`} variant="outline">
                                            {user.kycStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
