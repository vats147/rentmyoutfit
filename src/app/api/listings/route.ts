import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const getListingSchema = z.object({
  gender: z.enum(['all', 'women', 'men', 'kids']).optional().default('all'),
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  lat: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
  lng: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
  radius: z.string().regex(/^\d+$/).optional().default('10'),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
  sortBy: z.enum(['newest', 'price_low', 'price_high', 'rating', 'nearest']).optional().default('newest'),
});

const createListingSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000).optional(),
  category: z.string().min(1, 'Category is required'),
  gender: z.enum(['women', 'men', 'kids']),
  eventTags: z.array(z.string()).optional().default([]),
  customTags: z.array(z.string()).optional().default([]),
  size: z.string().optional(),
  measurements: z.object({
    waist: z.number().optional(),
    chest: z.number().optional(),
    length: z.number().optional(),
  }).optional(),
  color: z.string().optional(),
  fabric: z.string().optional(),
  condition: z.enum(['like_new', 'good', 'fair']).optional().default('good'),
  pricePerDay: z.number().positive('Price must be positive'),
  pricePerWeek: z.number().positive().optional(),
  deposit: z.number().min(100, 'Minimum deposit is Rs.100'),
  deliveryType: z.enum(['pickup', 'delivery', 'both']).optional().default('pickup'),
  serviceRadius: z.number().min(1).max(100).optional(),
  deliveryCharge: z.number().min(0).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

// Safe number parsing
function safeParseFloat(value: string | null | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function safeParseInt(value: string | null | undefined, defaultValue: number = 1): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
}

// GET /api/listings - Get all listings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const validationResult = getListingSchema.safeParse({
      gender: searchParams.get('gender') || 'all',
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      lat: searchParams.get('lat') || undefined,
      lng: searchParams.get('lng') || undefined,
      radius: searchParams.get('radius') || '10',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'newest',
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { gender, category, search, minPrice, maxPrice, lat, lng, radius, page, limit, sortBy } = validationResult.data;

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'active',
    };

    if (gender && gender !== 'all') {
      where.gender = gender;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { customTags: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) (where.pricePerDay as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.pricePerDay as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const pageNum = safeParseInt(page?.toString(), 1);
    const limitNum = Math.min(safeParseInt(limit?.toString(), 20), 50); // Max 50 per page

    // Get total count
    let total = 0;
    try {
      total = await db.listing.count({ where });
    } catch (dbError) {
      console.error('Database error counting listings:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database temporarily unavailable' },
        { status: 503 }
      );
    }

    // Get listings
    let listings = [];
    try {
      listings = await db.listing.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 5,
          },
          videos: {
            take: 1,
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              username: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy: sortBy === 'newest' ? { createdAt: 'desc' } : 
                  sortBy === 'price_low' ? { pricePerDay: 'asc' } :
                  sortBy === 'price_high' ? { pricePerDay: 'desc' } :
                  { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });
    } catch (dbError) {
      console.error('Database error fetching listings:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch listings from database' },
        { status: 503 }
      );
    }

    // Calculate distance if location provided
    const userLat = safeParseFloat(lat, null);
    const userLng = safeParseFloat(lng, null);
    const radiusKm = safeParseFloat(radius, 10);

    const listingsWithDistance = listings.map(listing => {
      let distance = null;
      if (userLat !== null && userLng !== null && listing.lat && listing.lng) {
        try {
          const R = 6371; // Earth's radius in km
          const dLat = (listing.lat - userLat) * Math.PI / 180;
          const dLng = (listing.lng - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(listing.lat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
        } catch {
          distance = null;
        }
      }
      return { ...listing, distance };
    });

    // Filter by radius if location provided
    const filteredListings = (userLat !== null && userLng !== null)
      ? listingsWithDistance.filter(l => l.distance === null || l.distance <= radiusKm)
      : listingsWithDistance;

    // Sort by distance if sortBy is 'nearest'
    if (sortBy === 'nearest' && userLat !== null && userLng !== null) {
      filteredListings.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredListings,
      pagination: {
        total,
        page: pageNum,
        pageSize: limitNum,
        hasMore: pageNum * limitNum < total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/listings:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    // Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = createListingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if seller exists (optional - for production)
    // For now, we'll allow any sellerId for demo

    // Create listing with transaction for atomicity
    const listing = await db.$transaction(async (tx) => {
      const newListing = await tx.listing.create({
        data: {
          sellerId: data.sellerId,
          title: data.title,
          description: data.description || '',
          category: data.category,
          gender: data.gender,
          eventTags: data.eventTags.join(','),
          customTags: data.customTags.join(','),
          size: data.size || null,
          measurements: data.measurements ? JSON.stringify(data.measurements) : null,
          color: data.color || null,
          fabric: data.fabric || null,
          condition: data.condition,
          pricePerDay: data.pricePerDay,
          pricePerWeek: data.pricePerWeek || null,
          deposit: data.deposit,
          deliveryType: data.deliveryType,
          serviceRadius: data.serviceRadius || null,
          deliveryCharge: data.deliveryCharge || null,
          lat: data.lat || null,
          lng: data.lng || null,
          status: 'pending_review',
        },
        include: {
          images: true,
        },
      });

      // Create images if provided
      if (data.images && data.images.length > 0) {
        await tx.listingImage.createMany({
          data: data.images.map((url, index) => ({
            listingId: newListing.id,
            url,
            order: index,
          })),
        });
      }

      return newListing;
    });

    return NextResponse.json({
      success: true,
      data: listing,
      message: 'Listing created successfully. It will be reviewed shortly.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Invalid seller ID' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create listing. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use PATCH for updates.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
