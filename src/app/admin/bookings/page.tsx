"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Calendar,
    Search,
    Filter,
    Eye,
    User,
    Package,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Booking {
    id: string;
    listing: { id: string; title: string } | null;
    customer: { id: string; displayName: string | null } | null;
    seller: { id: string; displayName: string | null } | null;
    startDate: string;
    endDate: string;
    totalPaid: number;
    status: string;
}

const ADMIN_HEADERS = { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret' };

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/bookings?limit=50', { headers: ADMIN_HEADERS });
            const json = await res.json();
            if (json.success) {
                setBookings(json.data);
            } else {
                setError(json.error || 'Failed to load bookings');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const filteredBookings = useMemo(() => bookings.filter(b =>
        (b.listing?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.customer?.displayName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.seller?.displayName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    ), [bookings, searchQuery]);

    return (
        <div className="p-8 space-y-6 min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Booking Management</h1>
                    <p className="text-slate-500 text-sm">Monitor platform bookings and transaction states</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search bookings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64 bg-white"
                        />
                    </div>
                    <Button variant="outline" className="bg-white" onClick={fetchBookings}>
                        <Filter className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50 text-slate-900">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Booking</TableHead>
                            <TableHead className="font-bold text-slate-700">Customer</TableHead>
                            <TableHead className="font-bold text-slate-700">Seller</TableHead>
                            <TableHead className="font-bold text-slate-700">Dates</TableHead>
                            <TableHead className="font-bold text-slate-700">Amount</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-slate-900">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7} className="h-16 animate-pulse bg-slate-50/50" />
                                </TableRow>
                            ))
                        ) : filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-400">
                                    No bookings found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking) => (
                                <TableRow key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{booking.listing?.title ?? 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-400">ID: {booking.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 text-sm">{booking.customer?.displayName ?? 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 text-sm">{booking.seller?.displayName ?? 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 text-sm">
                                                {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">₹{booking.totalPaid}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "capitalize font-bold text-[10px]",
                                            booking.status === 'rented' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                booking.status === 'otp_pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    booking.status === 'deposit_paid' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                        booking.status === 'returned' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            'bg-slate-100 text-slate-700 border-slate-200'
                                        )} variant="outline">
                                            {booking.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
