'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, MapPin, Shield, Star, Lock, MessageCircle, Eye, ShoppingCart, Calendar, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ImageCarousel } from '@/components/carousel/image-carousel';
import { getTrustLevel, TRUST_LEVELS } from '@/components/map/near-me-map';
import { PLATFORM_CONFIG, EVENT_TAGS } from '@/lib/constants';
import { DETAIL_TAGS } from '@/lib/detail-tags';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';

interface FullscreenGalleryProps {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookNow?: () => void;
}

export function FullscreenGallery({
  listing,
  open,
  onOpenChange,
  onBookNow
}: FullscreenGalleryProps) {
  const [currentTab, setCurrentTab] = useState('photos');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDetailTags, setSelectedDetailTags] = useState<string[]>(listing.detailTags || []);

  const images = listing.images.length > 0
    ? listing.images
    : [{ id: 'default', url: '/placeholder-outfit.png' }];

  const trustLevel = getTrustLevel(
    listing.seller.totalRentals || 0,
    listing.seller.rating || 0
  );
  const trustConfig = TRUST_LEVELS[trustLevel];
  const TrustIcon = trustConfig.icon;

  const totalDays = selectedDates.length;
  const rentalAmount = listing.pricePerDay * totalDays;
  const platformFee = Math.round(rentalAmount * (PLATFORM_CONFIG.platformFeePercent / 100));
  const deliveryCharge = deliveryType === 'delivery' ? (listing.deliveryCharge || 50) : 0;
  const totalAmount = rentalAmount + platformFee + deliveryCharge + listing.deposit;

  // Analytics data
  const analytics = listing.analytics || {
    impressions: Math.floor(Math.random() * 500) + 100,
    views: listing.viewCount || Math.floor(Math.random() * 200) + 50,
    addToCart: Math.floor(Math.random() * 30) + 5,
    dateSelected: Math.floor(Math.random() * 20) + 3,
    ordersCompleted: listing._count?.bookings || Math.floor(Math.random() * 15),
  };

  const toggleDetailTag = (tagId: string) => {
    setSelectedDetailTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img
              src={listing.seller.profileImage || '/placeholder-avatar.png'}
              alt={listing.seller.displayName || 'Seller'}
              className="w-10 h-10 rounded-full border-2 border-[#C9A84C]"
            />
            <div className="text-white">
              <p className="font-semibold text-sm">{listing.seller.displayName}</p>
              <div className="flex items-center gap-2">
                <Badge className={cn(trustConfig.color, "text-[10px] px-1.5")}>
                  <TrustIcon className="w-2.5 h-2.5 mr-0.5" />
                  {trustConfig.name}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#C9A84C] text-[#C9A84C]" />
                  <span className="text-xs">{(listing.seller.rating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-red-500 text-red-500")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {currentTab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ImageCarousel
              images={images}
              showClose={false}
              showZoom={true}
            />
          </motion.div>
        )}

        {currentTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-[#F9F6F0] pt-16"
          >
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="p-4 space-y-4">
                {/* Title & Price */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="font-bold text-xl text-gray-900">{listing.title}</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      {listing.distance && (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>{listing.distance.toFixed(1)} km away</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#C9A84C] font-bold text-xl">₹{listing.pricePerDay}</span>
                      <span className="text-gray-500 text-sm">/day</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Lock className="w-3 h-3" />
                      Deposit ₹{listing.deposit}
                    </div>
                  </div>
                </div>

                {/* Analytics Bar */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-white rounded-lg border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Eye className="w-3 h-3" />
                      <span className="font-bold text-sm">{analytics.impressions}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <ShoppingCart className="w-3 h-3" />
                      <span className="font-bold text-sm">{analytics.addToCart}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">In Cart</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-600">
                      <Calendar className="w-3 h-3" />
                      <span className="font-bold text-sm">{analytics.dateSelected}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Dates Picked</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <Package className="w-3 h-3" />
                      <span className="font-bold text-sm">{analytics.ordersCompleted}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Orders</p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-lg text-white">
                  <Shield className="w-5 h-5 text-[#C9A84C]" />
                  <div>
                    <p className="font-medium text-sm">{trustConfig.name} Seller</p>
                    <p className="text-xs text-white/70">{listing.seller.totalRentals || 0} successful rentals</p>
                  </div>
                  <Badge className={cn(trustConfig.color, "ml-auto")}>
                    <TrustIcon className="w-3 h-3 mr-1" />
                    {trustConfig.name}
                  </Badge>
                </div>

                {/* Detail Tags - Customer Added */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Features & Details</h3>
                  <div className="flex flex-wrap gap-2">
                    {DETAIL_TAGS.slice(0, 12).map(tag => {
                      const isSelected = selectedDetailTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleDetailTag(tag.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all touch-minimal",
                            isSelected
                              ? "bg-[#1B4332] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <span>{tag.icon}</span>
                          <span>{tag.name}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Event Tags */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Perfect For</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.eventTags.map(tag => {
                      const eventTag = EVENT_TAGS.find(e => e.id === tag);
                      return (
                        <Badge key={tag} variant="secondary" className="bg-[#1B4332]/10 text-[#1B4332]">
                          {eventTag?.name || tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About this outfit</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Size</div>
                    <div className="font-medium">{listing.size || 'Free size'}</div>

                    <div className="text-gray-500">Color</div>
                    <div className="font-medium">{listing.color || 'Multi'}</div>

                    <div className="text-gray-500">Fabric</div>
                    <div className="font-medium">{listing.fabric || 'Not specified'}</div>

                    <div className="text-gray-500">Condition</div>
                    <div className="font-medium capitalize">{listing.condition.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={listing.seller.profileImage || '/placeholder-avatar.png'}
                    alt={listing.seller.displayName || 'Seller'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{listing.seller.displayName}</p>
                    <p className="text-sm text-gray-500">@{listing.seller.username}</p>
                  </div>
                  <Button variant="outline" size="sm" className="touch-minimal">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {currentTab === 'book' && (
          <motion.div
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-[#F9F6F0] pt-16"
          >
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="p-4 space-y-4">
                <h2 className="font-bold text-lg">Book This Outfit</h2>

                {/* Calendar */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Select Dates</h3>
                  <CalendarComponent
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border w-full"
                  />
                </div>

                {/* Delivery Options */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={deliveryType === 'pickup' ? 'default' : 'outline'}
                      className={cn(
                        "h-auto py-3 flex-col touch-minimal",
                        deliveryType === 'pickup' && "bg-[#1B4332] hover:bg-[#2D6A4F]"
                      )}
                      onClick={() => setDeliveryType('pickup')}
                    >
                      <span className="font-medium">Pickup</span>
                      <span className="text-xs opacity-80">Free</span>
                    </Button>
                    {listing.deliveryType !== 'pickup' && (
                      <Button
                        variant={deliveryType === 'delivery' ? 'default' : 'outline'}
                        className={cn(
                          "h-auto py-3 flex-col touch-minimal",
                          deliveryType === 'delivery' && "bg-[#1B4332] hover:bg-[#2D6A4F]"
                        )}
                        onClick={() => setDeliveryType('delivery')}
                      >
                        <span className="font-medium">Delivery</span>
                        <span className="text-xs opacity-80">+₹{listing.deliveryCharge || 50}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                {totalDays > 0 && (
                  <div className="p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rental ({totalDays} days)</span>
                        <span>₹{rentalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Platform fee</span>
                        <span>₹{platformFee}</span>
                      </div>
                      {deliveryType === 'delivery' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery</span>
                          <span>₹{deliveryCharge}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{rentalAmount + platformFee + deliveryCharge}</span>
                      </div>
                      <div className="flex justify-between text-[#1B4332]">
                        <span>Security Deposit</span>
                        <span>₹{listing.deposit}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-[#C9A84C]">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#C9A84C]/10 rounded-lg flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600">
                    Your deposit is 100% safe with our platform and will be instantly refunded after you return the outfit in good condition.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t z-20">
        <div className="flex">
          <button
            onClick={() => setCurrentTab('photos')}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors touch-minimal",
              currentTab === 'photos'
                ? "text-[#1B4332] border-t-2 border-[#C9A84C]"
                : "text-gray-500"
            )}
          >
            Photos
          </button>
          <button
            onClick={() => setCurrentTab('details')}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors touch-minimal",
              currentTab === 'details'
                ? "text-[#1B4332] border-t-2 border-[#C9A84C]"
                : "text-gray-500"
            )}
          >
            Details
          </button>
          <button
            onClick={() => setCurrentTab('book')}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors touch-minimal",
              currentTab === 'book'
                ? "text-[#1B4332] border-t-2 border-[#C9A84C]"
                : "text-gray-500"
            )}
          >
            Book
          </button>
        </div>

        {/* Book Button */}
        {currentTab === 'book' && (
          <div className="p-4 bg-white border-t">
            <Button
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-12 touch-minimal"
              onClick={onBookNow}
              disabled={totalDays === 0}
            >
              {totalDays > 0
                ? `Pay ₹${totalAmount} to Book`
                : 'Select dates to book'
              }
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
