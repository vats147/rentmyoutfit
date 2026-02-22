'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, List, Map,
  Star, Shield, CheckCircle, Clock, Heart,
  ZoomIn, ZoomOut, Locate, AlertCircle,
  Search, SlidersHorizontal, ChevronDown, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';
import ReusableGoogleMap from '../maps/ReusableMap';

// Trust levels configuration
export const TRUST_LEVELS = {
  new: { name: 'New', color: 'bg-gray-100 text-gray-600', icon: Clock, minRentals: 0 },
  trusted: { name: 'Trusted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, minRentals: 5 },
  verified: { name: 'Verified', color: 'bg-green-100 text-green-700', icon: Shield, minRentals: 15 },
  superSeller: { name: 'Super Seller', color: 'bg-[#C9A84C]/20 text-[#1B4332]', icon: Star, minRentals: 30 },
};

// Get trust level based on rental count and rating
export function getTrustLevel(totalRentals: number, rating: number): keyof typeof TRUST_LEVELS {
  if (totalRentals >= 30 && rating >= 4.8) return 'superSeller';
  if (totalRentals >= 15 && rating >= 4.5) return 'verified';
  if (totalRentals >= 5 && rating >= 4.0) return 'trusted';
  return 'new';
}

// Surat city center coordinates
const SURAT_CENTER = { lat: 21.1702, lng: 72.8311 };
const SURAT_BOUNDS = {
  north: 21.25,
  south: 21.10,
  east: 72.95,
  west: 72.75
};

interface NearMeMapProps {
  listings: Listing[];
  onListingClick: (listing: Listing) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function NearMeMap({ listings, onListingClick, userLocation }: NearMeMapProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [hoveredListing, setHoveredListing] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Map logic is now handled by ReusableGoogleMap

  const renderTrustBadge = (listing: Listing, size: 'sm' | 'md' = 'sm') => {
    const trustLevel = getTrustLevel(
      listing.seller.totalRentals || 0,
      listing.seller.rating || 0
    );
    const config = TRUST_LEVELS[trustLevel];
    const Icon = config.icon;

    return (
      <Badge className={cn(
        config.color,
        "font-medium gap-1",
        size === 'sm' ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
      )}>
        <Icon className={size === 'sm' ? "w-2.5 h-2.5" : "w-3 h-3"} />
        {config.name}
      </Badge>
    );
  };

  const renderListItem = (listing: Listing) => {
    return (
      <motion.div
        key={listing.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-xl overflow-hidden shadow-md border cursor-pointer transition-all group/card",
          selectedListing?.id === listing.id ? "border-[#1B4332] ring-1 ring-[#1B4332]/10" : "border-gray-100 hover:border-[#1B4332]/30"
        )}
        onClick={() => {
          setSelectedListing(listing);
          onListingClick(listing);
        }}
      >
        <div className="flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={listing.images[0]?.url || '/placeholder-outfit.png'}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {renderTrustBadge(listing)}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                // toggle favorite logic
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>

            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-white/20">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Available Now</span>
              </div>
              {listing.distance && (
                <Badge className="bg-[#1B4332]/90 text-white text-[10px] backdrop-blur-sm border-none">
                  {listing.distance.toFixed(1)} km away
                </Badge>
              )}
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1 flex-1 leading-tight group-hover/card:text-[#1B4332] transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1 ml-2 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                <Star className="w-2.5 h-2.5 fill-[#C9A84C] text-[#C9A84C]" />
                <span className="text-[10px] font-bold text-slate-700">
                  {(listing.seller.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-2 truncate">@{listing.seller.username} • {listing.category || 'Surat'}</p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[#1B4332] font-black text-base leading-none">₹{listing.pricePerDay}</span>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-tighter mt-1">Rent / Day</span>
              </div>
              <div className="text-right">
                <span className="text-slate-900 font-bold text-xs block">₹{listing.deposit || '0'}</span>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-tighter">Security</span>
              </div>
            </div>

            <Button className="w-full h-9 bg-white hover:bg-slate-50 text-[#1B4332] border border-[#1B4332]/20 font-bold text-xs rounded-lg transition-all active:scale-[0.98]">
              Contact Owner
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Zoom and locate controls are now optional or handled by the map UI

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
      {/* Search & Filter Header (NoBroker Style) */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B4332]" />
            <div className="flex items-center gap-2 pl-9 pr-3 h-11 border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[#1B4332]/10 bg-white">
              <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-none px-2 py-0.5 rounded flex items-center gap-1 group">
                Surat
                <X className="w-3 h-3 cursor-pointer opacity-50 group-hover:opacity-100" />
              </Badge>
              <Input
                placeholder="Add more..."
                className="border-none shadow-none focus-visible:ring-0 p-0 h-auto"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide">
            {['Category', 'Condition', 'Budget', 'Occasion'].map((filter) => (
              <Button key={filter} variant="outline" size="sm" className="h-10 rounded-lg border-gray-200 text-gray-600 bg-gray-50/50 shrink-0">
                {filter} <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-50" />
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-10 rounded-lg border-gray-200 text-gray-600 bg-gray-50/50">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[700px]">
        {/* Left Side: Map */}
        <div className="flex-1 relative bg-gray-100">
          <ReusableGoogleMap
            center={userLocation || SURAT_CENTER}
            zoom={13}
            markers={listings.map(l => ({
              lat: l.lat || SURAT_CENTER.lat,
              lng: l.lng || SURAT_CENTER.lng,
              title: l.title,
              price: l.pricePerDay
            }))}
            className="w-full h-full"
          />
          {/* List/Map Floating Toggle for Mobile */}
          <div className="absolute top-4 right-4 lg:hidden z-10">
            <Button
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="rounded-full shadow-xl bg-[#1B4332] text-white"
            >
              {viewMode === 'map' ? <List className="w-4 h-4 mr-2" /> : <Map className="w-4 h-4 mr-2" />}
              {viewMode === 'map' ? 'Show List' : 'Show Map'}
            </Button>
          </div>
        </div>

        {/* Right Side: Scrollable List (NoBroker Style Side Panel) */}
        <div className={cn(
          "w-full lg:w-[580px] bg-slate-50 border-l border-gray-200 flex flex-col transition-all",
          viewMode === 'map' ? "hidden lg:flex" : "flex"
        )}>
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg text-slate-900">{listings.length}+ Outfits found</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs bg-white shadow-sm font-bold text-[#1B4332]">List</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500">Map</Button>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-[#1B4332] font-bold bg-[#1B4332]/5 px-2 py-1 rounded">No Brokerage</span>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">Verified Sellers</span>
            </div>
          </div>

          <ScrollArea className="flex-1 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group"
                  onMouseEnter={() => setHoveredListing(listing.id)}
                  onMouseLeave={() => setHoveredListing(null)}
                >
                  {renderListItem(listing)}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Support Banner */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="bg-brand-primary/5 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#1B4332]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1B4332]">Need help with booking?</p>
                <p className="text-[10px] text-slate-500">Our support team is online</p>
              </div>
              <Button size="sm" className="ml-auto bg-[#1B4332] text-white h-8 text-[10px]">Chat Now</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
