'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationSearchProps {
    onLocationSelect?: (location: { address: string; lat: number; lng: number }) => void;
    className?: string;
    placeholder?: string;
}

export function LocationSearch({
    onLocationSelect,
    className,
    placeholder = "Search up to 3 localities or landmarks"
}: LocationSearchProps) {
    const [inputValue, setInputValue] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.google) return;

        const initAutocomplete = () => {
            if (!inputRef.current) return;

            autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                componentRestrictions: { country: 'IN' },
                fields: ['formatted_address', 'geometry', 'name'],
                types: ['geocode', 'establishment']
            });

            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                if (place && place.geometry && place.geometry.location) {
                    const address = place.formatted_address || place.name || '';
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    setInputValue(address);
                    onLocationSelect?.({ address, lat, lng });
                }
            });

            setIsLoaded(true);
        };

        // Small delay to ensure script is ready if it's still loading
        const timer = setTimeout(initAutocomplete, 500);
        return () => clearTimeout(timer);
    }, [onLocationSelect]);

    const handleClear = () => {
        setInputValue('');
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className={cn("relative w-full max-w-2xl mx-auto px-4", className)}>
            <div className="flex items-center gap-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
                <div className="flex-1 relative flex items-center">
                    <MapPin className="absolute left-4 w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-14 pl-12 pr-10 text-gray-700 bg-transparent outline-none placeholder:text-gray-400 text-sm md:text-base font-medium"
                    />
                    {inputValue && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                <Button
                    className="h-14 px-8 rounded-none bg-[#FF385C] hover:bg-[#E31C5F] transition-colors gap-2 font-bold shadow-none border-0"
                >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                </Button>
            </div>

            {!isLoaded && (
                <div className="absolute top-1/2 -right-8 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                </div>
            )}

            <div className="mt-2 flex items-center justify-end">
                <img
                    src="https://developers.google.com/static/maps/images/powered-by-google-on-white.png"
                    alt="Powered by Google"
                    className="h-3 opacity-50"
                />
            </div>
        </div>
    );
}
