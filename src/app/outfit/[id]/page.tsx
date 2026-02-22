'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Shield, Heart, MapPin, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { sampleListings } from '@/lib/sample-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function OutfitDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const listing = sampleListings.find(l => l.id === params.id) || sampleListings[0];
    const [activeImage, setActiveImage] = useState(0);

    if (!listing) return <div>Not found</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-14 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 -ml-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Button>
                    <h1 className="font-semibold text-gray-900 line-clamp-1 text-sm">{listing.title}</h1>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="shrink-0 -mr-2">
                        <Share2 className="w-5 h-5 text-gray-700" />
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1">
                {/* Main Content */}
                <div className="bg-white px-4 pt-4 pb-6 mt-2 rounded-t-3xl shadow-sm">

                    {/* Image Gallery */}
                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm border border-gray-100">
                        <div className="absolute top-3 left-3 z-10 bg-[#00A95D] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            ₹500 OFF
                        </div>

                        {/* Main Image */}
                        <motion.img
                            key={activeImage}
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            src={listing.images[activeImage]?.url || listing.images[0]?.url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />

                        {/* Pagination Dots */}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                            {listing.images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-colors",
                                        activeImage === idx ? "bg-[#1B4332]" : "bg-white/60"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick thumbnails row (optional, matching blinkit's 2 options dropdown) */}
                    {listing.images.length > 1 && (
                        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide py-1">
                            {listing.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={cn(
                                        "w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                                        activeImage === idx ? "border-[#1B4332] shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Title & Pricing */}
                    <div className="mb-6">
                        <div className="text-[10px] text-gray-500 font-medium tracking-wide uppercase mb-1">
                            Delivery in 24 hours
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                            {listing.title}
                        </h1>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                            {listing.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">₹{listing.pricePerDay}</span>
                                    <span className="text-sm text-gray-400 line-through mb-1">₹{listing.pricePerDay + 500}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">per day • ₹{listing.deposit} deposit</div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl border-[#1B4332]/20 text-[#1B4332] h-9 px-4 font-semibold hover:bg-[#1B4332]/5">
                                Check Dates <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Highlights Section */}
                <div className="mt-2 bg-white px-4 py-5 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Highlights</h2>

                    <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] border-b border-gray-100">
                            <div className="bg-gray-50 p-3 text-gray-600 font-medium border-r border-gray-100 text-xs flex items-center">Fabric</div>
                            <div className="p-3 text-gray-900 text-xs flex items-center capitalize">{listing.detailTags.find(t => ['silk', 'cotton', 'georgette', 'velvet', 'linen', 'organza'].includes(t)) || 'Premium Fabric'}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] border-b border-gray-100">
                            <div className="bg-gray-50 p-3 text-gray-600 font-medium border-r border-gray-100 text-xs flex items-center">Size</div>
                            <div className="p-3 text-gray-900 text-xs flex items-center">{listing.size} ({listing.gender})</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] border-b border-gray-100">
                            <div className="bg-gray-50 p-3 text-gray-600 font-medium border-r border-gray-100 text-xs flex items-center">Condition</div>
                            <div className="p-3 text-gray-900 text-xs flex items-center capitalize">{listing.condition.replace('_', ' ')}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] border-b border-gray-100">
                            <div className="bg-gray-50 p-3 text-gray-600 font-medium border-r border-gray-100 text-xs flex items-center">Location</div>
                            <div className="p-3 text-gray-900 text-xs flex items-center">{listing.distance} km away</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr]">
                            <div className="bg-gray-50 p-3 text-gray-600 font-medium border-r border-gray-100 text-xs flex items-center">Usage Tip</div>
                            <div className="p-3 text-gray-900 text-xs flex items-center">Dry clean only. Handle embellishments with care.</div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-900">Platform Guarantee</p>
                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Quality inspected & secure deposit handling</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Snapshot */}
                <div className="mt-2 bg-white px-4 py-5 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
                        <Button variant="link" className="text-[#1B4332] text-xs h-auto p-0 font-semibold" onClick={() => { }}>View all 12</Button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-bold text-gray-900">4.8</div>
                        <div>
                            <div className="flex text-[#C9A84C] mb-1">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current opacity-50" />
                            </div>
                            <div className="text-[10px] text-gray-500">Based on 12 verified bookings</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Sample Review */}
                        <div className="border-b border-gray-100 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                                    <span className="text-xs font-medium text-gray-900">Sneha R.</span>
                                </div>
                                <div className="flex text-[#C9A84C]">
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">Beautiful outfit, exactly as shown in pictures. The seller was very cooperative with the fitting adjustments.</p>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-600 border-0 pointer-events-none">Clean outfit</Badge>
                                <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-600 border-0 pointer-events-none">True to size</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex gap-3">
                <Button variant="outline" className="h-12 w-12 shrink-0 rounded-xl border-gray-200">
                    <Heart className="w-5 h-5 text-gray-400" />
                </Button>
                <Button className="flex-1 h-12 rounded-xl bg-[#E31C5F] hover:bg-[#C21650] text-white font-bold text-sm shadow-sm">
                    Book Now
                </Button>
            </div>

        </div>
    );
}
