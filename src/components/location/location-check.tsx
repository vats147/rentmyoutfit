'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Surat city boundaries (approximate)
const SURAT_BOUNDS = {
  north: 21.25,
  south: 21.10,
  east: 72.95,
  west: 72.75
};

interface LocationCheckProps {
  onLocationVerified: () => void;
  onUseDemoMode: () => void;
}

export function LocationCheck({ onLocationVerified, onUseDemoMode }: LocationCheckProps) {
  const [status, setStatus] = useState<'checking' | 'success' | 'outside' | 'error' | 'denied'>('checking');
  const [cityName, setCityName] = useState<string>('');

  const checkLocation = useCallback(() => {
    setStatus('checking');

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Check if user is in Surat
        const isInSurat = 
          latitude >= SURAT_BOUNDS.south &&
          latitude <= SURAT_BOUNDS.north &&
          longitude >= SURAT_BOUNDS.west &&
          longitude <= SURAT_BOUNDS.east;

        if (isInSurat) {
          setStatus('success');
          setCityName('Surat');
          setTimeout(() => onLocationVerified(), 1500);
        } else {
          // Try to get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            setCityName(data.address?.city || data.address?.town || data.address?.state || 'Unknown');
          } catch {
            setCityName('Your location');
          }
          setStatus('outside');
        }
      },
      (error) => {
        console.error('Location error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationVerified]);

  useEffect(() => {
    // Defer to avoid synchronous setState warning
    const timer = setTimeout(() => {
      checkLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkLocation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            className="w-20 h-20 bg-[#C9A84C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <span className="text-[#1B4332] font-bold text-2xl">SR</span>
          </motion.div>
          <h1 className="text-white text-2xl font-bold">ShahidRa Rentals</h1>
          <p className="text-white/70 text-sm mt-1">Ethnic Outfit Rental Marketplace</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Checking Location */}
              {status === 'checking' && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Navigation className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                  <h2 className="font-semibold text-lg text-gray-900">Checking your location...</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    We're verifying if you're in Surat
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                  </div>
                </motion.div>
              )}

              {/* Location Success */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="font-semibold text-lg text-gray-900">Welcome to Surat!</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    You're in {cityName}. Enjoy browsing ethnic outfits near you.
                  </p>
                  <Badge className="mt-4 bg-green-100 text-green-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    Location Verified
                  </Badge>
                </motion.div>
              )}

              {/* Outside Surat */}
              {status === 'outside' && (
                <motion.div
                  key="outside"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h2 className="font-semibold text-lg text-gray-900">Currently in {cityName}</h2>
                  <p className="text-gray-500 text-sm mt-2 mb-4">
                    ShahidRa Rentals is currently only available in Surat, Gujarat.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] touch-minimal"
                      onClick={onUseDemoMode}
                    >
                      Explore Surat (Demo Mode)
                    </Button>
                    <p className="text-xs text-gray-400">
                      You can browse listings but won't be able to book
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Location Denied */}
              {status === 'denied' && (
                <motion.div
                  key="denied"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="font-semibold text-lg text-gray-900">Location Access Denied</h2>
                  <p className="text-gray-500 text-sm mt-2 mb-4">
                    Please enable location access to verify you're in Surat.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      variant="outline"
                      className="w-full touch-minimal"
                      onClick={checkLocation}
                    >
                      Try Again
                    </Button>
                    <Button 
                      className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] touch-minimal"
                      onClick={onUseDemoMode}
                    >
                      Continue in Demo Mode
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Location Error */}
              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h2 className="font-semibold text-lg text-gray-900">Location Error</h2>
                  <p className="text-gray-500 text-sm mt-2 mb-4">
                    We couldn't determine your location. Please try again.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      variant="outline"
                      className="w-full touch-minimal"
                      onClick={checkLocation}
                    >
                      Try Again
                    </Button>
                    <Button 
                      className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] touch-minimal"
                      onClick={onUseDemoMode}
                    >
                      Continue in Demo Mode
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/50 text-xs mt-6">
          ShahidRa Rentals is exclusively available in Surat, Gujarat
        </p>
      </motion.div>
    </motion.div>
  );
}
