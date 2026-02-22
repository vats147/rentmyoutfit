"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    ShoppingBag,
    Tag,
    User,
    Trash2,
    Plus,
    Pencil
} from "lucide-react";
import { ListOutfitForm } from "@/components/listings/list-outfit-form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Listing {
    id: string;
    title: string;
    seller: { id: string; displayName: string | null } | null;
    category: string;
    pricePerDay: number;
    status: string;
    _count?: { bookings: number; reviews: number };
}

const ADMIN_HEADERS = { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret' };

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

   
    const fetchListings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/listings?limit=50', { headers: ADMIN_HEADERS });
            const json = await res.json();
            if (json.success) {
                setListings(json.data);
            } else {
                setError(json.error || 'Failed to load listings');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const filteredListings = useMemo(() => listings.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.seller?.displayName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    ), [listings, searchQuery]);

    const handleDelete = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/listings/${id}`, {
                method: 'DELETE',
                headers: ADMIN_HEADERS,
            });
            const json = await res.json();
            if (json.success) {
                setListings(prev => prev.filter(l => l.id !== id));
            } else {
                setError(json.error || 'Failed to delete listing');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setActionLoading(null);
            setDeletingId(null);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/listings/${id}`, {
                method: 'PATCH',
                headers: { ...ADMIN_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const json = await res.json();
            if (json.success) {
                setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
            } else {
                setError(json.error || 'Failed to update listing');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setActionLoading(null);

        }
    };

    return (
        <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <div className="p-8 space-y-6 min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Listing Management</h1>
                    <p className="text-slate-500 text-sm">Review, approve and moderate outfit listings</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64 bg-white"
                        />
                    </div>
                    <Button variant="outline" className="bg-white" onClick={fetchListings}>
                        <Filter className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button className="bg-brand-primary text-white hover:bg-brand-primary/90" onClick={() => setIsCreating(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Listing
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 text-slate-900">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Listing</TableHead>
                            <TableHead className="font-bold text-slate-700">Seller</TableHead>
                            <TableHead className="font-bold text-slate-700">Category</TableHead>
                            <TableHead className="font-bold text-slate-700">Price/Day</TableHead>
                            <TableHead className="font-bold text-slate-700">Bookings</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-slate-900">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7} className="h-16 animate-pulse bg-slate-50/50" />
                                </TableRow>
                            ))
                        ) : filteredListings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-400">
                                    No listings found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredListings.map((listing) => (
                                <TableRow key={listing.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <span className="text-slate-800">{listing.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600">{listing.seller?.displayName ?? 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 text-sm">{listing.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">₹{listing.pricePerDay}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">{listing._count?.bookings ?? 0}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "capitalize font-bold text-[10px]",
                                            listing.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                                listing.status === 'pending_review' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                        )} variant="outline">
                                            {listing.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </Button>
                                            {listing.status === 'pending_review' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-green-50 text-green-600"
                                                        disabled={actionLoading === listing.id}
                                                        onClick={() => handleStatusChange(listing.id, 'active')}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-red-50 text-red-600"
                                                        disabled={actionLoading === listing.id}
                                                        onClick={() => handleStatusChange(listing.id, 'delisted')}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                                                onClick={() => setEditingListing(listing)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-50 text-slate-400 hover:text-red-600"
                                                disabled={actionLoading === listing.id}
                                                onClick={() => setDeletingId(listing.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the listing from the database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => deletingId && handleDelete(deletingId)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingListing) && (
            <ListOutfitForm
                initialData={editingListing ? {
                    ...editingListing,
                    // Map fields if necessary, as local Listing type is minimal
                    pricePerDay: editingListing.price
                } as any : undefined}
                onComplete={() => {
                    setIsCreating(false);
                    setEditingListing(null);
                    // Refresh listings or update local state
                }}
                onCancel={() => {
                    setIsCreating(false);
                    setEditingListing(null);
                }}
            />
        )}
        </AlertDialog>
    );
}
