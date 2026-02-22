'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES as categories } from '@/lib/constants';
import { sampleListings as mockListings } from '@/lib/sample-data';
import { OutfitCard } from '@/components/listings/outfit-card';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Include an "All" category at the top
    const allCategories = [
        { id: 'all', name: 'All Categories', icon: '✨' },
        ...Object.values(categories).flat()
    ];

    const filteredListings = mockListings.filter(listing => {
        const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory || (selectedCategory === 'women' && listing.gender === 'women') || (selectedCategory === 'men' && listing.gender === 'men');
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-16 flex items-center gap-3 shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 -ml-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Button>
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        placeholder="Search for lehenga, sherwani..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 border-transparent focus-visible:ring-1 focus-visible:ring-[#1B4332] pl-10 h-10 rounded-full text-sm"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Sidebar - Categories */}
                <div className="w-[85px] sm:w-[100px] shrink-0 bg-white border-r border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-10 flex flex-col">
                    <ScrollArea className="flex-1 w-full">
                        <div className="py-2 flex flex-col items-center">
                            {allCategories.map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "w-full py-4 px-2 flex flex-col items-center gap-2 transition-all relative",
                                            isSelected ? "bg-red-50/50" : "hover:bg-gray-50"
                                        )}
                                    >
                                        {/* Selection Indicator Line */}
                                        {isSelected && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute left-0 top-2 bottom-2 w-1 bg-[#E31C5F] rounded-r-md"
                                            />
                                        )}

                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm transition-transform",
                                            isSelected ? "bg-white ring-2 ring-[#E31C5F] ring-offset-1 scale-105" : "bg-gray-50 ring-1 ring-gray-200"
                                        )}>
                                            {cat.icon}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] text-center leading-tight font-medium px-1",
                                            isSelected ? "text-[#E31C5F]" : "text-gray-500"
                                        )}>
                                            {cat.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Content - Grid */}
                <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden relative">

                    {/* Quick Filters Bar (Sticky) */}
                    <div className="bg-white/80 backdrop-blur-md px-3 py-2.5 border-b border-gray-100 z-20 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs shrink-0 gap-1.5 border-gray-200 shadow-sm bg-white">
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                        </Button>
                        {['Lehenga', 'Saree', 'Sherwani', 'Kurta'].map(filter => (
                            <Button key={filter} variant="outline" size="sm" className="h-8 rounded-full text-xs shrink-0 border-gray-200 bg-white">
                                {filter}
                            </Button>
                        ))}
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs shrink-0 gap-1 shadow-sm border-gray-200 bg-white">
                            Type <ChevronDown className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs shrink-0 gap-1 shadow-sm border-gray-200 bg-white">
                            Sort By <ChevronDown className="w-3 h-3" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-24">
                            {filteredListings.length > 0 ? (
                                filteredListings.map((listing, index) => (
                                    <motion.div
                                        key={listing.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.05, 0.5) }}
                                    >
                                        <OutfitCard
                                            listing={listing}
                                            variant="compact"
                                            onClick={() => router.push(`/outfit/${listing.id}`)}
                                            onSave={() => { }}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No outfits found</h3>
                                    <p className="text-sm text-gray-500 mt-1">Try selecting a different category or search term.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4 rounded-full"
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setSearchQuery('');
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
