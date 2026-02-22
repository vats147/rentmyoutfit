import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating review
const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  authorId: z.string().min(1, 'Author ID is required'),
  targetType: z.enum(['listing', 'customer']),
  targetId: z.string().min(1, 'Target ID is required'),
  listingId: z.string().min(1, 'Listing ID is required'),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(20, 'Review must be at least 20 characters').max(500),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url()).max(5).optional(),
});

// GET /api/reviews - Get reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    const where: Record<string, unknown> = { isVisible: true };

    if (listingId) {
      where.listingId = listingId;
    }

    if (userId) {
      where.targetType = 'customer';
      where.targetId = userId;
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        author: {
          select: { id: true, displayName: true, username: true, profileImage: true },
        },
        media: true,
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.review.count({ where });

    // Calculate average rating for listing
    let avgRating = null;
    if (listingId) {
      const ratingStats = await db.review.aggregate({
        where: { listingId, isVisible: true },
        _avg: { rating: true },
      });
      avgRating = ratingStats._avg.rating;
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        pageSize: limit,
        hasMore: page * limit < total,
      },
      averageRating: avgRating,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validationResult = createReviewSchema.safeParse(body);
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

    // Check if booking exists and is completed
    const booking = await db.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is returned/completed
    if (!['returned', 'deposit_released'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: 'You can only review after the rental is completed' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this booking
    const existingReview = await db.review.findFirst({
      where: {
        bookingId: data.bookingId,
        authorId: data.authorId,
        targetType: data.targetType,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this booking' },
        { status: 409 }
      );
    }

    // Create review (invisible until blind period ends)
    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          bookingId: data.bookingId,
          authorId: data.authorId,
          targetType: data.targetType,
          targetId: data.targetId,
          listingId: data.listingId,
          rating: data.rating,
          text: data.text,
          tags: data.tags.join(','),
          isVisible: false, // Blind review - will be made visible after 48h or when both parties review
        },
      });

      // Add media if provided
      if (data.images && data.images.length > 0) {
        await tx.reviewMedia.createMany({
          data: data.images.map((url, index) => ({
            reviewId: newReview.id,
            type: 'image',
            url,
          })),
        });
      }

      return newReview;
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// POST /api/reviews/vote - Vote on a review
export async function PATCH(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { reviewId, userId, helpful } = body;

    if (!reviewId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Review ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if already voted
    const existingVote = await db.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });

    if (existingVote) {
      // Update vote
      await db.reviewVote.update({
        where: { id: existingVote.id },
        data: { helpful },
      });
    } else {
      // Create vote
      await db.reviewVote.create({
        data: { reviewId, userId, helpful },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Vote recorded',
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
