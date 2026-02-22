// Database types
export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  category: string;
  gender: 'women' | 'men' | 'kids';
  eventTags: string[];
  customTags?: string[];
  detailTags?: string[]; // Customer-added detail tags like handwork, val, etc.
  size?: string;
  measurements?: {
    waist?: number;
    chest?: number;
    length?: number;
  };
  color?: string;
  fabric?: string;
  condition: 'like_new' | 'good' | 'fair';
  pricePerDay: number;
  pricePerWeek?: number;
  deposit: number;
  deliveryType: 'pickup' | 'delivery' | 'both';
  serviceRadius?: number;
  deliveryCharge?: number;
  status: 'draft' | 'pending_review' | 'active' | 'paused' | 'delisted';
  lat?: number;
  lng?: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
  videos: ListingVideo[];
  seller: Seller;
  reviews?: Review[];
  _count?: {
    reviews: number;
    bookings: number;
  };
  distance?: number; // calculated field for near me
  analytics?: ListingAnalytics;
}

// Analytics for listings
export interface ListingAnalytics {
  impressions: number;
  views: number;
  addToCart: number;
  dateSelected: number;
  checkoutStarted: number;
  ordersCompleted: number;
  wishlistAdded: number;
  shareCount: number;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  order: number;
}

export interface ListingVideo {
  id: string;
  listingId: string;
  url: string;
  thumbnail?: string;
}

export interface Seller {
  id: string;
  displayName?: string;
  username?: string;
  profileImage?: string;
  rating?: number;
  totalRentals?: number;
  memberSince?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  authorId: string;
  targetType: 'listing' | 'customer';
  targetId: string;
  listingId: string;
  rating: number;
  text?: string;
  tags?: string[];
  isVisible: boolean;
  createdAt: string;
  author?: {
    id: string;
    displayName?: string;
    username?: string;
    profileImage?: string;
  };
  media?: ReviewMedia[];
}

export interface ReviewMedia {
  id: string;
  reviewId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Booking {
  id: string;
  listingId: string;
  customerId: string;
  sellerId: string;
  startDate: string;
  endDate: string;
  rentalAmount: number;
  depositAmount: number;
  platformFee: number;
  deliveryCharge: number;
  totalPaid: number;
  status: BookingStatus;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  pickupOtp?: string;
  returnOtp?: string;
  depositReleased: boolean;
  createdAt: string;
  listing?: Listing;
  customer?: {
    id: string;
    displayName?: string;
    username?: string;
    profileImage?: string;
  };
  seller?: Seller;
}

export type BookingStatus = 
  | 'initiated'
  | 'deposit_paid'
  | 'otp_pending'
  | 'otp_verified'
  | 'rented'
  | 'return_initiated'
  | 'returned'
  | 'deposit_released'
  | 'cancelled';

export interface UserEventDate {
  id: string;
  userId: string;
  eventType: string;
  eventDate: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface AddressFormData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface ListingFormData {
  title: string;
  description: string;
  category: string;
  gender: 'women' | 'men' | 'kids';
  eventTags: string[];
  customTags: string[];
  size: string;
  measurements?: {
    waist?: number;
    chest?: number;
    length?: number;
  };
  color: string;
  fabric: string;
  condition: 'like_new' | 'good' | 'fair';
  pricePerDay: number;
  pricePerWeek?: number;
  deposit: number;
  deliveryType: 'pickup' | 'delivery' | 'both';
  serviceRadius?: number;
  deliveryCharge?: number;
  images: File[];
  videos?: File[];
}

export interface BookingFormData {
  listingId: string;
  startDate: string;
  endDate: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddressId?: string;
}

export interface ReviewFormData {
  bookingId: string;
  targetType: 'listing' | 'customer';
  targetId: string;
  listingId: string;
  rating: number;
  text: string;
  tags: string[];
  images: File[];
  video?: File;
}
