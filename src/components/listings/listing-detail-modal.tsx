'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Share2, MapPin, Star, Calendar, Truck,
  MessageCircle, Shield, Lock, ChevronLeft, ChevronRight, 
  CheckCircle, Clock, Award
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuthStore } from '@/stores';
import { EVENT_TAGS, PLATFORM_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getTrustLevel, TRUST_LEVELS } from '@/components/map/near-me-map';
import type { Listing } from '@/types';

interface ListingDetailModalProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailModal({ 
  listing, 
  open, 
  onOpenChange 
}: ListingDetailModalProps) {
  const { isAuthenticated } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [showBookingSheet, setShowBookingSheet] = useState(false);

  if (!listing) return null;

  const images = listing.images.length > 0 
    ? listing.images.map(i => i.url) 
    : ['https://placehold.co/400x500/1B4332/FFFFFF?text=No+Image'];

  const totalDays = selectedDates.length;
  const rentalAmount = listing.pricePerDay * totalDays;
  const platformFee = Math.round(rentalAmount * (PLATFORM_CONFIG.platformFeePercent / 100));
  const deliveryCharge = deliveryType === 'delivery' ? (listing.deliveryCharge || 50) : 0;
  const totalAmount = rentalAmount + platformFee + deliveryCharge + listing.deposit;

  // Get seller trust level
  const trustLevel = getTrustLevel(
    listing.seller.totalRentals || 0,
    listing.seller.rating || 0
  );
  const trustConfig = TRUST_LEVELS[trustLevel];
  const TrustIcon = trustConfig.icon;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      onOpenChange(false);
      return;
    }
    setShowBookingSheet(true);
  };

  const renderTrustBadge = () => (
    <Badge className={cn(trustConfig.color, "gap-1 font-medium")}>
      <TrustIcon className="w-3 h-3" />
      {trustConfig.name} Seller
    </Badge>
  );

  return (
    <>
      {/* Main Detail Sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[95vh] rounded-t-3xl p-0 flex flex-col"
          style={{ 
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 0.5rem)',
            touchAction: 'pan-y'
          }}
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain touch-scroll">
            {/* Image Gallery */}
            <div className="relative aspect-[4/5] bg-gray-100 shrink-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center active:bg-white touch-minimal"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center active:bg-white touch-minimal"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all touch-minimal",
                        i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Header actions */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/80 active:bg-white touch-minimal"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/80 active:bg-white touch-minimal"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={cn(
                      "w-5 h-5",
                      isLiked ? "fill-red-500 text-red-500" : ""
                    )} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/80 active:bg-white touch-minimal"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Badge Overlay */}
              <div className="absolute bottom-4 right-4">
                {renderTrustBadge()}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 pb-32">
              {/* Title & Price */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-4">
                  <h1 className="font-bold text-xl text-gray-900">{listing.title}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    {listing.distance && (
                      <>
                        <MapPin className="w-4 h-4 text-[#1B4332]" />
                        <span>{listing.distance.toFixed(1)} km away</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#C9A84C] font-bold text-xl">Rs.{listing.pricePerDay}</span>
                    <span className="text-gray-500 text-sm">/day</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Lock className="w-3 h-3" />
                    Deposit Rs.{listing.deposit}
                  </div>
                </div>
              </div>

              {/* Rating & Trust */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {renderTrustBadge()}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= (listing.seller.rating || 0)
                          ? "fill-[#C9A84C] text-[#C9A84C]"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    {(listing.seller.rating || 0).toFixed(1)} ({listing._count?.reviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Event Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {listing.eventTags.map(tag => {
                  const eventTag = EVENT_TAGS.find(e => e.id === tag);
                  return (
                    <Badge key={tag} variant="secondary" className="bg-[#1B4332]/10 text-[#1B4332]">
                      {eventTag?.name || tag}
                    </Badge>
                  );
                })}
              </div>

              {/* Trust Indicators */}
              <div className="bg-gradient-to-r from-[#1B4332]/5 to-[#C9A84C]/5 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1B4332]" />
                  Why rent from this seller
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Verified Seller</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Deposit Protected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <span>OTP Handover</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-[#C9A84C]" />
                    <span>{listing.seller.totalRentals || 0} Rentals</span>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Dates
                </h3>
                <CalendarComponent
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border w-full"
                />
                {totalDays > 0 && (
                  <div className="mt-2 p-3 bg-[#1B4332]/5 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {totalDays} day{totalDays > 1 ? 's' : ''} selected
                    </p>
                    <p className="font-semibold text-[#1B4332]">
                      Rental: Rs.{rentalAmount}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Options */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery Options
                </h3>
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
                    <span className="text-xs opacity-80">From seller</span>
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
                      <span className="text-xs opacity-80">+Rs.{listing.deliveryCharge || 50}</span>
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">About this outfit</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Details */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
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

              {/* Tags */}
              {listing.customTags && listing.customTags.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.customTags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Seller Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Seller</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={listing.seller.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller'}
                    alt={listing.seller.displayName || 'Seller'}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A84C]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {listing.seller.displayName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">@{listing.seller.username || 'seller'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderTrustBadge()}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-[#C9A84C] text-[#C9A84C]" />
                        {(listing.seller.rating || 0).toFixed(1)}
                        <span className="mx-1">•</span>
                        <span>{listing.seller.totalRentals || 0} rentals</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="touch-minimal shrink-0">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>

              {/* Reviews section */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Reviews</h3>
                {listing.reviews && listing.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {listing.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={review.author?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium">{review.author?.displayName || 'User'}</span>
                          <div className="flex items-center gap-0.5 ml-auto">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-3 h-3",
                                  star <= review.rating
                                    ? "fill-[#C9A84C] text-[#C9A84C]"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.text}</p>
                      </div>
                    ))}
                    {listing._count?.reviews && listing._count.reviews > 3 && (
                      <Button variant="link" className="w-full text-[#1B4332] touch-minimal">
                        View all {listing._count.reviews} reviews
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No reviews yet</p>
                    <p className="text-xs">Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 shrink-0"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 1rem)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Total for {totalDays || 1} day{totalDays > 1 ? 's' : ''}</p>
                <p className="font-bold text-lg text-gray-900">Rs.{totalDays > 0 ? totalAmount : listing.pricePerDay + listing.deposit}</p>
              </div>
              <Button 
                className="bg-[#1B4332] hover:bg-[#2D6A4F] px-6 h-11 touch-minimal"
                onClick={handleBookNow}
              >
                {isAuthenticated ? 'Book Now' : 'Sign in to Book'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Booking Sheet */}
      <Sheet open={showBookingSheet} onOpenChange={setShowBookingSheet}>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] rounded-t-2xl p-0 flex flex-col"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 0.5rem)' }}
        >
          <SheetHeader className="p-4 border-b shrink-0">
            <SheetTitle>Confirm Booking</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Order Summary */}
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={images[0]}
                  alt={listing.title}
                  className="w-20 h-20 object-cover rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{listing.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalDays || 1} day{(totalDays || 1) > 1 ? 's' : ''} rental
                  </p>
                  <div className="mt-2">
                    {renderTrustBadge()}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rental ({totalDays || 1} days)</span>
                  <span>Rs.{rentalAmount || listing.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform fee ({PLATFORM_CONFIG.platformFeePercent}%)</span>
                  <span>Rs.{platformFee || Math.round(listing.pricePerDay * 0.05)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span>Rs.{deliveryCharge}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>Rs.{(rentalAmount || listing.pricePerDay) + (platformFee || Math.round(listing.pricePerDay * 0.05)) + deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-[#1B4332]">
                  <span>Security Deposit (refundable)</span>
                  <span>Rs.{listing.deposit}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Pay now</span>
                  <span>Rs.{totalDays > 0 ? totalAmount : listing.pricePerDay + listing.deposit + Math.round(listing.pricePerDay * 0.05)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#C9A84C]/10 rounded-lg flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">
                  Your deposit is protected and will be refunded after you return the outfit in good condition.
                </p>
              </div>

              <div className="p-3 bg-[#1B4332]/5 rounded-lg flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">
                  OTP will be generated for secure handover. Both parties must verify for deposit release.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-4 border-t shrink-0"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 1rem)' }}
          >
            <Button className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-12 touch-minimal">
              Pay Rs.{totalDays > 0 ? totalAmount : listing.pricePerDay + listing.deposit + Math.round(listing.pricePerDay * 0.05)} with Razorpay
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
