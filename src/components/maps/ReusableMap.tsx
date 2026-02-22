"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Map, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: { lat: number; lng: number; title?: string; price?: number | string }[];
    className?: string;
}

declare global {
    interface Window {
        google: any;
    }
}

export default function ReusableGoogleMap({
    center,
    zoom = 15,
    markers = [],
    className = "h-full w-full rounded-2xl border-4 border-white shadow-xl"
}: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useEffect(() => {
        // Check if API key exists in environment
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setStatus("error");
            return;
        }

        let retryCount = 0;
        const maxRetries = 20; // 10 seconds total

        const checkGoogle = () => {
            if (window.google && window.google.maps && mapRef.current) {
                setStatus("ready");
                initMap();
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkGoogle, 500);
            } else {
                setStatus("error");
            }
        };

        const initMap = () => {
            if (!window.google || !window.google.maps || !mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center,
                zoom,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#1B4332" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#e9e9e9" }]
                    },
                ],
                disableDefaultUI: true,
                zoomControl: true,
            });

            markers.forEach(marker => {
                const labelColor = "#1B4332";
                const bgColor = "#FFFFFF";
                const priceLabel = marker.price
                    ? (typeof marker.price === 'number' ? `₹${(marker.price / 1000).toFixed(1)}k` : marker.price)
                    : "";

                new window.google.maps.Marker({
                    position: { lat: marker.lat, lng: marker.lng },
                    map,
                    title: marker.title,
                    label: priceLabel ? {
                        text: priceLabel,
                        color: labelColor,
                        fontSize: "12px",
                        fontWeight: "bold",
                        className: "map-price-label"
                    } : undefined,
                    icon: priceLabel ? {
                        path: "M -20,0 L 20,0 L 20,-24 L -20,-24 Z", // Box shape for label background
                        fillColor: bgColor,
                        fillOpacity: 1,
                        strokeColor: "#C9A84C",
                        strokeWeight: 2,
                        labelOrigin: new window.google.maps.Point(0, -12),
                        anchor: new window.google.maps.Point(0, 0)
                    } : {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#1B4332",
                        fillOpacity: 1,
                        strokeWeight: 4,
                        strokeColor: "#C9A84C",
                    }
                });
            });
        };

        checkGoogle();
    }, [center, zoom, markers]);

    return (
        <div className={cn("relative overflow-hidden group", className)}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .map-price-label {
                    background: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 2px solid #C9A84C;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            `}} />
            {status === "loading" && (
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3 z-10">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Loading Map...</p>
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Google Maps Not Configured</h4>
                    <p className="text-xs text-slate-500 max-w-[200px]">
                        Please add your <code className="bg-slate-200 px-1 rounded text-[10px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to the .env file to enable this view.
                    </p>
                </div>
            )}

            <div ref={mapRef} className={cn("h-full w-full rounded-xl transition-opacity duration-500", status === "ready" ? "opacity-100" : "opacity-0")} />

            {status === "ready" && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-brand-primary/10">
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Service Location</p>
                    <p className="text-xs text-slate-600 font-medium">Surat, Gujarat • Verified Access</p>
                </div>
            )}
        </div>
    );
}
