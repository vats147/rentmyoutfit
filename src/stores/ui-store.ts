import { create } from 'zustand';

interface UIState {
  // Navigation
  activeTab: 'home' | 'search' | 'map' | 'bookings' | 'profile';
  
  // Search & Filters
  searchQuery: string;
  selectedGender: 'all' | 'women' | 'men' | 'kids';
  selectedCategory: string | null;
  selectedEvents: string[];
  priceRange: [number, number];
  sortBy: 'nearest' | 'price_low' | 'price_high' | 'rating' | 'newest';
  
  // Location
  userLocation: { lat: number; lng: number } | null;
  locationPermission: 'pending' | 'granted' | 'denied';
  searchRadius: number; // in km
  
  // Modals & Sheets
  isFilterSheetOpen: boolean;
  isBookingSheetOpen: boolean;
  isOTPModalOpen: boolean;
  
  // Actions
  setActiveTab: (tab: UIState['activeTab']) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGender: (gender: UIState['selectedGender']) => void;
  setSelectedCategory: (category: string | null) => void;
  toggleEvent: (event: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: UIState['sortBy']) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setLocationPermission: (permission: UIState['locationPermission']) => void;
  setSearchRadius: (radius: number) => void;
  setFilterSheetOpen: (open: boolean) => void;
  setBookingSheetOpen: (open: boolean) => void;
  setOTPModalOpen: (open: boolean) => void;
  resetFilters: () => void;
}

const defaultPriceRange: [number, number] = [0, 10000];

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  searchQuery: '',
  selectedGender: 'all',
  selectedCategory: null,
  selectedEvents: [],
  priceRange: defaultPriceRange,
  sortBy: 'newest',
  userLocation: null,
  locationPermission: 'pending',
  searchRadius: 10,
  isFilterSheetOpen: false,
  isBookingSheetOpen: false,
  isOTPModalOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGender: (gender) => set({ selectedGender: gender }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleEvent: (event) => set((state) => ({
    selectedEvents: state.selectedEvents.includes(event)
      ? state.selectedEvents.filter((e) => e !== event)
      : [...state.selectedEvents, event]
  })),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setUserLocation: (location) => set({ userLocation: location }),
  setLocationPermission: (permission) => set({ locationPermission: permission }),
  setSearchRadius: (radius) => set({ searchRadius: radius }),
  setFilterSheetOpen: (open) => set({ isFilterSheetOpen: open }),
  setBookingSheetOpen: (open) => set({ isBookingSheetOpen: open }),
  setOTPModalOpen: (open) => set({ isOTPModalOpen: open }),
  resetFilters: () => set({
    searchQuery: '',
    selectedGender: 'all',
    selectedCategory: null,
    selectedEvents: [],
    priceRange: defaultPriceRange,
    sortBy: 'newest'
  })
}));
