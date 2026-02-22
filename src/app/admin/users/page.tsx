"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users,
    Search,
    Filter,
    ShieldAlert,
    UserCheck,
    UserX,
    Mail,
    Phone,
    ShieldCheck,
    Pause
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    isHoldSelling: boolean;
    createdAt: string;
    _count?: { listings: number; bookingsAsCustomer: number };
}

const ADMIN_HEADERS = { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret', 'Content-Type': 'application/json' };

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (searchQuery) params.set('search', searchQuery);
            const res = await fetch(`/api/admin/users?${params}`, { headers: ADMIN_HEADERS });
            const json = await res.json();
            if (json.success) {
                setUsers(json.data);
            } else {
                setError(json.error || 'Failed to load users');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAction = async (userId: string, action: string) => {
        setActionLoading(userId + action);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: ADMIN_HEADERS,
                body: JSON.stringify({ action }),
            });
            const json = await res.json();
            if (json.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...json.data } : u));
            } else {
                setError(json.error || 'Failed to update user');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setActionLoading(null);
        }
    };

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Filter className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">User</TableHead>
                            <TableHead className="font-bold text-slate-700">Role</TableHead>
                            <TableHead className="font-bold text-slate-700">KYC Status</TableHead>
                            <TableHead className="font-bold text-slate-700">Listings</TableHead>
                            <TableHead className="font-bold text-slate-700">Joined</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-50/50" />
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                                    No users found
                                </TableCell>
                            </TableRow>
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
                                        {user._count?.listings ?? 0}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {user.kycStatus !== 'verified' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-green-50 text-green-600"
                                                    title="Verify KYC"
                                                    disabled={actionLoading === user.id + 'verify_kyc'}
                                                    onClick={() => handleAction(user.id, 'verify_kyc')}
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {user.isBanned ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-green-50 text-green-600"
                                                    title="Unban User"
                                                    disabled={actionLoading === user.id + 'unban'}
                                                    onClick={() => handleAction(user.id, 'unban')}
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-red-50 text-red-600"
                                                    title="Ban User"
                                                    disabled={actionLoading === user.id + 'ban'}
                                                    onClick={() => handleAction(user.id, 'ban')}
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {user.isHoldSelling ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-green-50 text-slate-400"
                                                    title="Release Selling Hold"
                                                    disabled={actionLoading === user.id + 'release_hold'}
                                                    onClick={() => handleAction(user.id, 'release_hold')}
                                                >
                                                    <Pause className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                                                    title="Hold Selling"
                                                    disabled={actionLoading === user.id + 'hold_selling'}
                                                    onClick={() => handleAction(user.id, 'hold_selling')}
                                                >
                                                    <Pause className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
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
