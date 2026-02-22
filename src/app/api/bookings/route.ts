import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating booking
const createBookingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  startDate: z.string().transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Invalid start date');
    if (date < new Date()) throw new Error('Start date cannot be in the past');
    return date;
  }),
  endDate: z.string().transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Invalid end date');
    return date;
  }),
  deliveryType: z.enum(['pickup', 'delivery']).default('pickup'),
  deliveryAddress: z.string().optional(),
});

// GET /api/bookings - Get bookings (for user or admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'customer';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    
    if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.customerId = userId;
    }

    if (status) {
      where.status = status;
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        listing: {
          include: {
            images: { take: 1 },
            seller: {
              select: { id: true, displayName: true, username: true, profileImage: true },
            },
          },
        },
        customer: {
          select: { id: true, displayName: true, username: true, profileImage: true },
        },
        seller: {
          select: { id: true, displayName: true, username: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.booking.count({ where });

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page,
        pageSize: limit,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
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

    const validationResult = createBookingSchema.safeParse(body);
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

    // Validate end date is after start date
    if (data.endDate <= data.startDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Get listing details
    const listing = await db.listing.findUnique({
      where: { id: data.listingId },
      include: { seller: true },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'This listing is not available for booking' },
        { status: 400 }
      );
    }

    // Check if listing is available for these dates
    const existingBookings = await db.booking.findMany({
      where: {
        listingId: data.listingId,
        status: { in: ['initiated', 'deposit_paid', 'otp_pending', 'otp_verified', 'rented'] },
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This outfit is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Calculate pricing
    const days = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const rentalAmount = listing.pricePerDay * days;
    const platformFee = rentalAmount * 0.05; // 5% platform fee
    const deliveryCharge = data.deliveryType === 'delivery' ? (listing.deliveryCharge || 50) : 0;
    const totalPaid = rentalAmount + platformFee + deliveryCharge + listing.deposit;

    // Generate OTP
    const pickupOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create booking
    const booking = await db.booking.create({
      data: {
        listingId: data.listingId,
        customerId: data.customerId,
        sellerId: listing.sellerId,
        startDate: data.startDate,
        endDate: data.endDate,
        rentalAmount,
        depositAmount: listing.deposit,
        platformFee,
        deliveryCharge,
        totalPaid,
        status: 'initiated',
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        pickupOtp,
      },
      include: {
        listing: {
          include: {
            images: { take: 1 },
            seller: {
              select: { id: true, displayName: true, username: true, phone: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking initiated. Please proceed with payment.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings - Update booking status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { status, otp, action } = body;

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Handle OTP verification
    if (action === 'verify_pickup_otp') {
      if (otp !== booking.pickupOtp) {
        return NextResponse.json(
          { success: false, error: 'Invalid OTP' },
          { status: 400 }
        );
      }
      
      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'otp_verified' },
      });

      return NextResponse.json({
        success: true,
        message: 'OTP verified. Deposit is now locked.',
      });
    }

    // Handle return OTP
    if (action === 'verify_return_otp') {
      if (otp !== booking.returnOtp) {
        return NextResponse.json(
          { success: false, error: 'Invalid OTP' },
          { status: 400 }
        );
      }
      
      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'returned', depositReleased: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Return confirmed. Deposit will be released within 24 hours.',
      });
    }

    // Handle status update
    if (status) {
      const validStatuses = [
        'initiated', 'deposit_paid', 'otp_pending', 'otp_verified',
        'rented', 'return_initiated', 'returned', 'deposit_released', 'cancelled'
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }

      const updatedBooking = await db.booking.update({
        where: { id: bookingId },
        data: { status },
      });

      return NextResponse.json({
        success: true,
        data: updatedBooking,
        message: 'Booking status updated',
      });
    }

    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
