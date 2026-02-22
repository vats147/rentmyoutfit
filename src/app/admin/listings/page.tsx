"use client";

import { useEffect, useState, useMemo } from "react";
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
    seller: string;
    category: string;
    price: number;
    views: number;
    status: string;
}

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        // Mock data for now - will connect to real API
        setTimeout(() => {
            setListings([
                { id: "1", title: "Bridal Red Lehenga Choli", seller: "Priya Sharma", category: "Lehenga Choli", price: 1500, views: 234, status: "active" },
                { id: "2", title: "Designer Sherwani Set", seller: "Raj Malhotra", category: "Sherwani", price: 1200, views: 156, status: "pending_review" },
                { id: "3", title: "Pink Anarkali Suit", seller: "Anjali Patel", category: "Anarkali", price: 800, views: 89, status: "paused" },
                { id: "4", title: "Royal Blue Bandhgala", seller: "Vikram Singh", category: "Bandhgala", price: 1000, views: 67, status: "delisted" },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const filteredListings = useMemo(() => listings.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.seller.toLowerCase().includes(searchQuery.toLowerCase())
    ), [listings, searchQuery]);

    const handleDelete = async (id: string) => {
        try {
            // Optimistic update
            setListings(prev => prev.filter(l => l.id !== id));
            setDeletingId(null);

            // API call
            await fetch(`/api/listings/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete listing", error);
            // Optionally revert state here if needed
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
                    <Button variant="outline" className="bg-white">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="bg-brand-primary text-white hover:bg-brand-primary/90" onClick={() => setIsCreating(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Listing
                    </Button>
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 text-slate-900">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Listing</TableHead>
                            <TableHead className="font-bold text-slate-700">Seller</TableHead>
                            <TableHead className="font-bold text-slate-700">Category</TableHead>
                            <TableHead className="font-bold text-slate-700">Price/Day</TableHead>
                            <TableHead className="font-bold text-slate-700">Views</TableHead>
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
                                            <span className="text-slate-600">{listing.seller}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 text-sm">{listing.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">₹{listing.price}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">{listing.views}</TableCell>
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-50 text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 text-red-600">
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
                                                onClick={() => setDeletingId(listing.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-400">
                                                <MoreVertical className="w-4 h-4" />
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
                        This action cannot be undone. This will permanently delete the listing.
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
