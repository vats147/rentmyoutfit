'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Lock, Eye, ShoppingCart, Calendar, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DETAIL_TAGS } from '@/lib/detail-tags';
import type { Listing } from '@/types';

interface OutfitCardProps {
  listing: Listing;
  onClick?: () => void;
  onSave?: () => void;
  variant?: 'default' | 'wide' | 'compact';
  showRating?: boolean;
  showNewBadge?: boolean;
  showAnalytics?: boolean;
}

export function OutfitCard({
  listing,
  onClick,
  onSave,
  variant = 'default',
  showRating = false,
  showNewBadge = false,
  showAnalytics = false
}: OutfitCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const mainImage = listing.images[0]?.url || '/placeholder-outfit.png';
  const reviewCount = listing._count?.reviews || 0;
  const avgRating = listing.seller.rating || 0;

  // Analytics data
  const analytics = listing.analytics || {
    impressions: Math.floor(Math.random() * 500) + 100,
    views: listing.viewCount || Math.floor(Math.random() * 200) + 50,
    addToCart: Math.floor(Math.random() * 30) + 5,
    dateSelected: Math.floor(Math.random() * 20) + 3,
    ordersCompleted: listing._count?.bookings || Math.floor(Math.random() * 15),
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onSave?.();
  };

  // Get detail tags with icons
  const getDetailTagInfo = (tagId: string) => {
    return DETAIL_TAGS.find(t => t.id === tagId) || { id: tagId, name: tagId, icon: '🏷️' };
  };

  const renderDetailTags = () => {
    if (!listing.detailTags || listing.detailTags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {listing.detailTags.slice(0, 4).map(tagId => {
          const tagInfo = getDetailTagInfo(tagId);
          return (
            <Badge
              key={tagId}
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 bg-white/80"
            >
              <span className="mr-0.5">{tagInfo.icon}</span>
              {tagInfo.name}
            </Badge>
          );
        })}
        {listing.detailTags.length > 4 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-white/80">
            +{listing.detailTags.length - 4}
          </Badge>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!showAnalytics) return null;

    return (
      <div className="grid grid-cols-2 gap-1 mt-2 p-2 bg-gray-50 rounded-lg text-[10px]">
        <div className="flex items-center gap-1 text-gray-600">
          <Eye className="w-3 h-3" />
          <span>{analytics.impressions} impressions</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <ShoppingCart className="w-3 h-3" />
          <span>{analytics.addToCart} in cart</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>{analytics.dateSelected} dates picked</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <Package className="w-3 h-3" />
          <span>{analytics.ordersCompleted} orders</span>
        </div>
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <Card
        className="overflow-hidden cursor-pointer group border-0 shadow-sm bg-white break-inside-avoid mb-2"
        onClick={onClick}
      >
        <div className="relative bg-gray-100 aspect-[4/5] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}
          <img
            src={mainImage}
            alt={listing.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleSaveClick}
          >
            <Heart className={cn(
              "w-3 h-3 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            )} />
          </Button>
        </div>

        <CardContent className="p-1.5">
          <div className="space-y-0.5">
            <h3 className="font-medium text-gray-900 line-clamp-1 text-[9px] leading-tight">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-[9px] text-[#C9A84C] font-bold">
                ₹{listing.pricePerDay}
              </div>
              <div className="flex items-center gap-0.5 text-[8px] text-gray-500 scale-90 origin-right">
                <MapPin className="w-2 h-2" />
                <span>{listing.distance?.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'wide') {
    return (
      <Card
        className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}
          <img
            src={mainImage}
            alt={listing.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {listing.distance && (
              <Badge className="bg-white/90 text-gray-900 hover:bg-white text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.distance.toFixed(1)} km
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white ml-auto touch-minimal"
              onClick={handleSaveClick}
            >
              <Heart className={cn(
                "w-4 h-4 transition-colors",
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              )} />
            </Button>
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <CardContent className="p-3">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">
            {listing.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[#C9A84C] font-bold">₹{listing.pricePerDay}</span>
              <span className="text-gray-500 text-xs">/day</span>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Star className="w-3 h-3 fill-[#C9A84C] text-[#C9A84C]" />
                {avgRating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            Deposit ₹{listing.deposit}
          </div>

          {/* Detail Tags */}
          {renderDetailTags()}

          {/* Analytics */}
          {renderAnalytics()}

          <div className="flex items-center gap-2 mt-2">
            <img
              src={listing.seller.profileImage || '/placeholder-avatar.png'}
              alt={listing.seller.displayName || 'Seller'}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-gray-600">@{listing.seller.username || 'seller'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <img
          src={mainImage}
          alt={listing.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {listing.distance && (
              <Badge className="bg-white/90 text-gray-900 hover:bg-white text-xs w-fit">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.distance.toFixed(1)} km
              </Badge>
            )}
            {showNewBadge && (
              <Badge className="bg-[#1B4332] text-white text-xs w-fit">
                New
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white touch-minimal"
            onClick={handleSaveClick}
          >
            <Heart className={cn(
              "w-4 h-4 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            )} />
          </Button>
        </div>

        {/* Rating badge */}
        {showRating && avgRating > 0 && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-white/90 text-gray-900 hover:bg-white text-xs">
              <Star className="w-3 h-3 mr-1 fill-[#C9A84C] text-[#C9A84C]" />
              {avgRating.toFixed(1)} ({reviewCount})
            </Badge>
          </div>
        )}

        {/* Views indicator */}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-black/50 text-white text-[10px]">
            <Eye className="w-3 h-3 mr-1" />
            {analytics.views}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">
          {listing.title}
        </h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-[#C9A84C] font-bold">₹{listing.pricePerDay}</span>
          <span className="text-gray-500 text-xs">/day</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          Deposit ₹{listing.deposit}
        </div>

        {/* Detail Tags */}
        {renderDetailTags()}

        <div className="flex items-center gap-2 mt-2">
          <img
            src={listing.seller.profileImage || '/placeholder-avatar.png'}
            alt={listing.seller.displayName || 'Seller'}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-gray-600 truncate">@{listing.seller.username || 'seller'}</span>
        </div>

        {/* Analytics */}
        {renderAnalytics()}
      </CardContent>
    </Card>
  );
}
