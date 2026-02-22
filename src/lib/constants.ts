// Categories for ethnic wear
export const CATEGORIES = {
  women: [
    { id: 'lehenga_choli', name: 'Lehenga Choli', icon: 'sparkles' },
    { id: 'saree', name: 'Saree', icon: 'flower-2' },
    { id: 'kurti_set', name: 'Kurti Set', icon: 'shirt' },
    { id: 'anarkali', name: 'Anarkali Suit', icon: 'sparkles' },
    { id: 'sharara', name: 'Sharara / Gharara', icon: 'sparkles' },
    { id: 'indo_western', name: 'Indo-Western', icon: 'sparkles' },
    { id: 'gown', name: 'Gown', icon: 'sparkles' },
  ],
  men: [
    { id: 'sherwani', name: 'Sherwani', icon: 'crown' },
    { id: 'kurta_pajama', name: 'Kurta Pajama', icon: 'shirt' },
    { id: 'nehru_jacket', name: 'Nehru Jacket', icon: 'shirt' },
    { id: 'bandhgala', name: 'Bandhgala Suit', icon: 'crown' },
    { id: 'jodhpuri', name: 'Jodhpuri Suit', icon: 'crown' },
  ],
  kids: [
    { id: 'boys_ethnic', name: 'Boys Ethnic', icon: 'sparkles' },
    { id: 'girls_ethnic', name: 'Girls Ethnic', icon: 'sparkles' },
  ],
};

// Event tags for filtering
export const EVENT_TAGS = [
  { id: 'marriage', name: 'Marriage / Wedding', icon: 'heart' },
  { id: 'engagement', name: 'Engagement', icon: 'gem' },
  { id: 'mehndi', name: 'Mehndi / Haldi', icon: 'flower' },
  { id: 'sangeet', name: 'Sangeet', icon: 'music' },
  { id: 'carnival', name: 'Carnival / Garba', icon: 'party-popper' },
  { id: 'birthday', name: 'Birthday Party', icon: 'cake' },
  { id: 'festival', name: 'Festival', icon: 'sparkles' },
  { id: 'corporate', name: 'Corporate Event', icon: 'building' },
  { id: 'casual', name: 'Casual / Everyday', icon: 'sun' },
];

// Custom tags for listings
export const CUSTOM_TAGS = [
  'handicraft',
  'embroidery',
  'zardozi',
  'bridal',
  'designer',
  'traditional',
  'silk',
  'cotton',
  'velvet',
  'georgette',
  'chiffon',
  'handwoven',
  'vintage',
  'designer replica',
];

// Sizes
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Fabric options
export const FABRICS = [
  'Silk',
  'Cotton',
  'Velvet',
  'Georgette',
  'Chiffon',
  'Crepe',
  'Satin',
  'Brocade',
  'Linen',
  'Rayon',
  'Blends',
];

// Conditions
export const CONDITIONS = [
  { id: 'like_new', name: 'Like New', description: 'Worn once or twice' },
  { id: 'good', name: 'Good', description: 'Minor signs of wear' },
  { id: 'fair', name: 'Fair', description: 'Visible wear but functional' },
];

// Colors (common ethnic wear colors)
export const COLORS = [
  { name: 'Red', hex: '#DC2626' },
  { name: 'Maroon', hex: '#7F1D1D' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy', hex: '#1E40AF' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Grey', hex: '#6B7280' },
];

// Sort options
export const SORT_OPTIONS = [
  { id: 'nearest', name: 'Nearest First' },
  { id: 'price_low', name: 'Price: Low to High' },
  { id: 'price_high', name: 'Price: High to Low' },
  { id: 'rating', name: 'Top Rated' },
  { id: 'newest', name: 'Newest First' },
];

// Review tags
export const REVIEW_TAGS_LISTING = [
  'Clean outfit',
  'Accurate photos',
  'Fast pickup',
  'Great quality',
  'True to size',
  'Good communication',
];

export const REVIEW_TAGS_CUSTOMER = [
  'Returned on time',
  'Good condition',
  'Communicative',
  'Punctual pickup',
  'Polite',
];

// Platform defaults
export const PLATFORM_CONFIG = {
  minDeposit: 500,
  platformFeePercent: 5,
  maxImagesPerListing: 10,
  maxVideosPerListing: 1,
  maxReviewImages: 5,
  maxReviewVideoDuration: 30, // seconds
  otpExpiryMinutes: 10,
  depositReleaseHours: 24,
  defaultSearchRadius: 10, // km
  maxSearchRadius: 50, // km
};

// Indian states
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
];
