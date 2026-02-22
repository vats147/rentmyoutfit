'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, SlidersHorizontal, Heart, Star,
  ChevronRight, Sparkles, TrendingUp, Clock, Users,
  Shirt, Crown, Flower2, Sparkle, PartyPopper, Navigation,
  Shield, Plus, User, Package, Wallet, Gift, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuthStore, useUIStore } from '@/stores';
import { CATEGORIES, EVENT_TAGS, SORT_OPTIONS, PLATFORM_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { LoginModal } from '@/components/auth/login-modal';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { OutfitCard } from '@/components/listings/outfit-card';
import { AdminPanel } from '@/components/admin/admin-panel';
import { AdminLogin } from '@/components/admin/admin-login';
import { ListOutfitForm } from '@/components/listings/list-outfit-form';
import { NearMeMap, getTrustLevel, TRUST_LEVELS } from '@/components/map/near-me-map';
import { FullscreenGallery } from '@/components/carousel/fullscreen-gallery';
import { LocationCheck } from '@/components/location/location-check';
import { MasonryGrid } from '@/components/ui/masonry-grid';
import { LocationSearch } from '@/components/ui/location-search';
import type { Listing } from '@/types';

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  lehenga_choli: <Sparkles className="w-4 h-4" />,
  saree: <Flower2 className="w-4 h-4" />,
  kurti_set: <Shirt className="w-4 h-4" />,
  anarkali: <Sparkles className="w-4 h-4" />,
  sherwani: <Crown className="w-4 h-4" />,
  kurta_pajama: <Shirt className="w-4 h-4" />,
  bandhgala: <Crown className="w-4 h-4" />,
};

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    selectedGender, setSelectedGender,
    selectedCategory, setSelectedCategory,
    selectedEvents, toggleEvent,
    priceRange, setPriceRange,
    sortBy, setSortBy,
    userLocation, setUserLocation,
    locationPermission, setLocationPermission,
    resetFilters
  } = useUIStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  // Location check states
  const [locationVerified, setLocationVerified] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Admin and additional states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showListOutfit, setShowListOutfit] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<NodeJS.Timeout | null>(null);

  // Real data state
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Fetch listings from backend
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoadingListings(true);
        // Note: Using localhost for development fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';
        const res = await fetch(`${apiUrl}/listings`);
        if (!res.ok) throw new Error('Failed to fetch listings');

        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.listings) {
          // Map backend data to match frontend requirements
          const formattedListings = data.data.listings.map((item: any) => ({
            ...item,
            distance: item.distance || (Math.random() * 10).toFixed(1), // Mock distance for now
            _count: item._count || { reviews: 0, bookings: 0 },
            analytics: item.analytics || { views: item.viewCount || 0 },
            eventTags: typeof item.eventTags === 'string' ? item.eventTags.split(',') : (item.eventTags || []),
            customTags: typeof item.customTags === 'string' ? item.customTags.split(',') : (item.customTags || []),
          }));
          setListings(formattedListings);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoadingListings(false);
      }
    }

    fetchListings();
  }, []);

  // Request location on mount - using ref to avoid re-renders
  useEffect(() => {
    if (locationRequested || typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    // Defer all state updates to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setLocationRequested(true);
      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setIsLocating(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [locationRequested, setUserLocation, setLocationPermission]);

  // Handle logo tap for admin access (5 taps within 2 seconds)
  const handleLogoTap = useCallback(() => {
    logoTapCount.current += 1;

    if (logoTapTimer.current) {
      clearTimeout(logoTapTimer.current);
    }

    if (logoTapCount.current >= 5) {
      setShowAdminLogin(true);
      logoTapCount.current = 0;
    } else {
      logoTapTimer.current = setTimeout(() => {
        logoTapCount.current = 0;
      }, 2000);
    }
  }, []);

  // Get user location (manual trigger)
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationPermission('granted');
        setIsLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setUserLocation, setLocationPermission]);

  // Filter listings based on current filters
  const filteredListings = listings.filter(listing => {
    if (selectedGender !== 'all' && listing.gender !== selectedGender) return false;
    if (selectedCategory && listing.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = listing.title.toLowerCase().includes(query);
      const matchesDesc = listing.description?.toLowerCase().includes(query);
      const matchesTags = listing.customTags?.some(t => typeof t === 'string' && t.toLowerCase().includes(query));
      if (!matchesTitle && !matchesDesc && !matchesTags) return false;
    }
    if (selectedEvents.length > 0) {
      const hasEvent = listing.eventTags?.some(e => selectedEvents.includes(e));
      if (!hasEvent) return false;
    }
    if (listing.pricePerDay < priceRange[0] || listing.pricePerDay > priceRange[1]) return false;
    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'nearest':
        return (a.distance || 999) - (b.distance || 999);
      case 'price_low':
        return a.pricePerDay - b.pricePerDay;
      case 'price_high':
        return b.pricePerDay - a.pricePerDay;
      case 'rating':
        return (b.seller.rating || 0) - (a.seller.rating || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Get all categories for pills
  const allCategories = [
    { id: '', name: 'All', icon: <Sparkle className="w-4 h-4" /> },
    ...Object.values(CATEGORIES).flat().map(c => ({
      id: c.id,
      name: c.name,
      icon: categoryIcons[c.id] || <Shirt className="w-4 h-4" />
    }))
  ];

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setShowDetailModal(true); // This now opens the fullscreen gallery
  };

  const handleSaveListing = (listingId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    console.log('Save listing:', listingId);
  };

  // Show location check if not verified and not in demo mode
  if (!locationVerified && !demoMode) {
    return (
      <LocationCheck
        onLocationVerified={() => setLocationVerified(true)}
        onUseDemoMode={() => setDemoMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-[#F9F6F0]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1B4332] text-white shrink-0">
        <div className="px-4 py-3">
          {/* Location bar */}
          <div className="flex items-center gap-2 text-sm mb-3">
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

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search lehenga, sherwani, saree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-11 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400"
            />
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-600 hover:text-gray-900"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-left">Filters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)]">
                  <div className="space-y-6 pb-6">
                    {/* Gender */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Gender</h4>
                      <ToggleGroup
                        type="single"
                        value={selectedGender}
                        onValueChange={(v) => v && setSelectedGender(v as typeof selectedGender)}
                        className="justify-start gap-2"
                      >
                        <ToggleGroupItem value="all" className="px-4">All</ToggleGroupItem>
                        <ToggleGroupItem value="women" className="px-4">Women</ToggleGroupItem>
                        <ToggleGroupItem value="men" className="px-4">Men</ToggleGroupItem>
                        <ToggleGroupItem value="kids" className="px-4">Kids</ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    <Separator />

                    {/* Events */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Occasion</h4>
                      <div className="flex flex-wrap gap-2">
                        {EVENT_TAGS.map(event => (
                          <Badge
                            key={event.id}
                            variant={selectedEvents.includes(event.id) ? 'default' : 'outline'}
                            className={cn(
                              "cursor-pointer transition-all px-3 py-1.5",
                              selectedEvents.includes(event.id)
                                ? "bg-[#1B4332] text-white hover:bg-[#2D6A4F]"
                                : "hover:bg-[#1B4332]/10"
                            )}
                            onClick={() => toggleEvent(event.id)}
                          >
                            {event.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Range */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        Price per day: ₹{priceRange[0]} - ₹{priceRange[1]}
                      </h4>
                      <Slider
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as [number, number])}
                        min={0}
                        max={10000}
                        step={100}
                        className="mt-4"
                      />
                    </div>

                    <Separator />

                    {/* Sort By */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Sort By</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {SORT_OPTIONS.map(option => (
                          <Button
                            key={option.id}
                            variant={sortBy === option.id ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                              "justify-start",
                              sortBy === option.id && "bg-[#1B4332] hover:bg-[#2D6A4F]"
                            )}
                            onClick={() => setSortBy(option.id as typeof sortBy)}
                          >
                            {option.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Apply button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        resetFilters();
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F]"
                      onClick={() => setFilterSheetOpen(false)}
                    >
                      Show {sortedListings.length} Results
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category pills */}
        <div className="px-4 py-3 sticky top-[108px] z-30 bg-[#F9F6F0]/80 backdrop-blur-md">
          <ScrollArea>
            <div className="flex gap-2 pb-2">
              {allCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'secondary'}
                  size="sm"
                  className={cn(
                    "rounded-full px-4 h-9 font-medium whitespace-nowrap",
                    selectedCategory === cat.id
                      ? "bg-[#1B4332] text-white hover:bg-[#2D6A4F]"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                  )}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        {/* Event Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] border-0">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <PartyPopper className="w-5 h-5 text-[#C9A84C]" />
                  <span className="font-semibold">Wedding Season is here!</span>
                </div>
                <p className="text-sm text-white/80">Find your perfect outfit now</p>
              </div>
              <Button variant="secondary" size="sm" className="bg-[#C9A84C] text-[#1B4332] hover:bg-[#F0D080]">
                Explore
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Near Me Section with Map */}
        <section className="mb-6">
          <NearMeMap
            listings={sortedListings.slice(0, 6)}
            onListingClick={handleListingClick}
            userLocation={userLocation}
          />
        </section>

        {/* Trending Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1B4332]" />
              <h2 className="font-semibold text-lg text-gray-900">Trending This Week</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-[#1B4332]" onClick={() => window.location.href = '/explore'}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {sortedListings.slice(0, 6).map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OutfitCard
                  listing={listing}
                  variant="compact"
                  onClick={() => handleListingClick(listing)}
                  onSave={() => handleSaveListing(listing.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* By Category - Women */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1B4332]" />
              <h2 className="font-semibold text-lg text-gray-900">Women's Collection</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-[#1B4332]" onClick={() => window.location.href = '/explore?gender=women'}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <ScrollArea>
            <div className="flex gap-3 pb-2">
              {sortedListings.filter(l => l.gender === 'women').slice(0, 4).map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="shrink-0 w-[160px]"
                >
                  <OutfitCard
                    listing={listing}
                    variant="compact"
                    onClick={() => handleListingClick(listing)}
                    onSave={() => handleSaveListing(listing.id)}
                  />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </section>

        {/* By Category - Men */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#1B4332]" />
              <h2 className="font-semibold text-lg text-gray-900">Men's Collection</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-[#1B4332]" onClick={() => window.location.href = '/explore?gender=men'}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <ScrollArea>
            <div className="flex gap-3 pb-2">
              {sortedListings.filter(l => l.gender === 'men').slice(0, 4).map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="shrink-0 w-[160px]"
                >
                  <OutfitCard
                    listing={listing}
                    variant="compact"
                    onClick={() => handleListingClick(listing)}
                    onSave={() => handleSaveListing(listing.id)}
                  />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </section>

        {/* Top Rated Sellers */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#C9A84C] fill-[#C9A84C]" />
              <h2 className="font-semibold text-lg text-gray-900">Top Rated Near You</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-[#1B4332]" onClick={() => window.location.href = '/explore?gender=men'}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {sortedListings
              .sort((a, b) => (b.seller.rating || 0) - (a.seller.rating || 0))
              .slice(0, 6)
              .map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OutfitCard
                    listing={listing}
                    variant="compact"
                    onClick={() => handleListingClick(listing)}
                    onSave={() => handleSaveListing(listing.id)}
                  />
                </motion.div>
              ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1B4332]" />
              <h2 className="font-semibold text-lg text-gray-900">New Arrivals</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-[#1B4332]">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {sortedListings.slice(0, 6).map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OutfitCard
                  listing={listing}
                  variant="compact"
                  onClick={() => handleListingClick(listing)}
                  onSave={() => handleSaveListing(listing.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Search, title: 'Browse', desc: 'Find outfits near you' },
              { icon: Heart, title: 'Book', desc: 'Pay deposit & confirm' },
              { icon: Users, title: 'Wear', desc: 'Pick up & enjoy' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-2">
                  <step.icon className="w-6 h-6 text-[#1B4332]" />
                </div>
                <h3 className="font-medium text-sm text-gray-900">{step.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pinterest-style Explore Section */}
        <section className="mb-6 px-1">
          <div className="flex items-center justify-between mb-4 px-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="font-semibold text-lg text-gray-900">Explore Ethnic</h2>
            </div>
          </div>
          <MasonryGrid>
            {sortedListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <OutfitCard
                  listing={listing}
                  variant="compact"
                  onClick={() => handleListingClick(listing)}
                  onSave={() => handleSaveListing(listing.id)}
                />
              </motion.div>
            ))}
          </MasonryGrid>
        </section>

        {/* Admin Access Button */}
        <section className="mb-6 text-center">
          <button
            onClick={handleLogoTap}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Shield className="w-3 h-3" />
            <span>Tap 5 times for Admin</span>
          </button>
        </section>

        {/* Quick Actions for Logged In Users */}
        {isAuthenticated && (
          <section className="mb-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setShowListOutfit(true)}
              >
                <Plus className="w-6 h-6 text-[#1B4332]" />
                <span className="text-sm font-medium">List an Outfit</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setShowProfileSheet(true)}
              >
                <User className="w-6 h-6 text-[#1B4332]" />
                <span className="text-sm font-medium">My Profile</span>
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        onProfileClick={() => setShowProfileSheet(true)}
        onListOutfitClick={() => setShowListOutfit(true)}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />

      {/* Fullscreen Gallery - Image Carousel */}
      {selectedListing && (
        <FullscreenGallery
          listing={selectedListing}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onBookNow={() => {
            setShowDetailModal(false);
            if (!isAuthenticated) {
              setShowLoginModal(true);
            }
          }}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLogin
        open={showAdminLogin}
        onOpenChange={setShowAdminLogin}
        onSuccess={() => setIsAdminMode(true)}
      />

      {/* Admin Panel */}
      {isAdminMode && (
        <AdminPanel onLogout={() => setIsAdminMode(false)} />
      )}

      {/* List Outfit Form */}
      {showListOutfit && (
        <ListOutfitForm
          onComplete={() => setShowListOutfit(false)}
          onCancel={() => setShowListOutfit(false)}
        />
      )}

      {/* Profile Sheet */}
      <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-60px)] mt-4">
            {isAuthenticated && user ? (
              <div className="space-y-6 pb-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xl font-bold">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.displayName || 'User'}</h3>
                    <p className="text-gray-500 text-sm">{user.email || user.phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#1B4332]">0</p>
                    <p className="text-xs text-gray-500">Listings</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#1B4332]">0</p>
                    <p className="text-xs text-gray-500">Rentals</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#C9A84C]">Rs.{user.walletBalance}</p>
                    <p className="text-xs text-gray-500">Wallet</p>
                  </div>
                </div>

                <Separator />

                {/* Menu Items */}
                <div className="space-y-1">
                  {[
                    { icon: Package, label: 'My Bookings', badge: '0' },
                    { icon: Shirt, label: 'My Listings', badge: '0' },
                    { icon: Heart, label: 'Saved Items', badge: '0' },
                    { icon: Wallet, label: 'Wallet', badge: `Rs.${user.walletBalance}` },
                    { icon: Gift, label: 'Refer & Earn', badge: 'Rs.200' },
                    { icon: Settings, label: 'Settings' },
                    { icon: Shield, label: 'Admin Panel', href: '/admin' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        if (item.href) {
                          window.location.href = item.href;
                          setShowProfileSheet(false);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary">{item.badge}</Badge>
                      )}
                    </button>
                  ))}
                </div>

                <Separator />

                {/* Referral Section */}
                <div className="p-4 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-lg text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-[#C9A84C]" />
                    <span className="font-semibold">Refer & Earn</span>
                  </div>
                  <p className="text-sm text-white/80 mb-3">
                    Share your code and earn Rs.200 for every friend who completes their first rental!
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded px-3 py-2 font-mono text-sm">
                      SHAHIDRA200
                    </div>
                    <Button variant="secondary" size="sm" className="bg-[#C9A84C] text-[#1B4332]">
                      Copy
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200"
                  onClick={() => {
                    useAuthStore.getState().logout();
                    setShowProfileSheet(false);
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Sign in to continue</h3>
                <p className="text-gray-500 text-sm text-center mb-4">
                  Access your bookings, listings, and more
                </p>
                <Button
                  className="bg-[#1B4332] hover:bg-[#2D6A4F]"
                  onClick={() => {
                    setShowProfileSheet(false);
                    setShowLoginModal(true);
                  }}
                >
                  Sign In
                </Button>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
