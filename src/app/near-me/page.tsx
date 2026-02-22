'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, MapPin, Navigation, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores';
import { NearMeMap } from '@/components/map/near-me-map';
import type { Listing } from '@/types';
import Link from 'next/link';

export default function NearMePage() {
  const { userLocation, setUserLocation } = useUIStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
        setListings([
            {
                id: "1",
                title: "Bridal Red Lehenga Choli",
                seller: { username: "priya_s", rating: 4.8, totalRentals: 20 },
                category: "Lehenga Choli",
                pricePerDay: 1500,
                deposit: 3000,
                images: [{ url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2883&auto=format&fit=crop" }],
                lat: 21.1702,
                lng: 72.8311,
                distance: 1.2,
                status: "active",
                createdAt: new Date().toISOString(),
                views: 234,
                description: "Beautiful red lehenga for wedding",
                gender: "women",
                size: "M",
                condition: "new",
                occasion: ["wedding"],
                location: "Surat",
                _count: { reviews: 5, bookings: 2 }
            } as any,
            {
                id: "2",
                title: "Designer Sherwani Set",
                seller: { username: "raj_m", rating: 4.5, totalRentals: 10 },
                category: "Sherwani",
                pricePerDay: 1200,
                deposit: 2500,
                images: [{ url: "https://images.unsplash.com/photo-1597983073493-88cd357a8169?q=80&w=2835&auto=format&fit=crop" }],
                lat: 21.1802,
                lng: 72.8411,
                distance: 2.5,
                status: "active",
                createdAt: new Date().toISOString(),
                 views: 156,
                description: "Royal sherwani for groom",
                gender: "men",
                size: "L",
                condition: "like_new",
                occasion: ["wedding"],
                location: "Surat",
                _count: { reviews: 3, bookings: 1 }
            } as any,
        ]);
        setLoading(false);
    }, 800);
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setUserLocation]);

  return (
    <div className="min-h-screen bg-[#F9F6F0]">
      <header className="sticky top-0 z-40 bg-[#1B4332] text-white shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="flex items-center gap-1 text-white/80 hover:text-white mr-4">
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
            </Link>
            <MapPin className="w-4 h-4 text-[#C9A84C]" />
            {userLocation ? (
              <span className="text-white/90">Near you</span>
            ) : (
              <button
                onClick={requestLocation}
                className="flex items-center gap-1 text-[#C9A84C] hover:text-[#F0D080] transition-colors"
              >
                <Navigation className="w-3 h-3" />
                {isLocating ? 'Locating...' : 'Enable location'}
              </button>
            )}
          </div>

           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search lehenga, sherwani, saree..."
              className="pl-10 pr-12 h-11 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>
      </header>

      <main className="p-4 h-[calc(100vh-140px)]">
         <NearMeMap
            listings={listings}
            onListingClick={(l) => console.log(l)}
            userLocation={userLocation}
          />
      </main>
    </div>
  );
}
