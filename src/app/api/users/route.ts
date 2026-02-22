import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const updateUserSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50).optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  profileImage: z.string().url('Invalid profile image URL').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  role: z.enum(['customer', 'seller', 'both']).optional(),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode (6 digits required)'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
});

// GET /api/users/me - Get current user
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return a mock user or check for user-id header
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      // Return demo user for unauthenticated requests
      return NextResponse.json({
        success: true,
        data: {
          id: 'demo-user',
          displayName: 'Demo User',
          username: 'demo_user',
          email: 'demo@shahidra.com',
          phone: '+919876543210',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
          gender: 'female',
          role: 'both',
          kycStatus: 'verified',
          isBanned: false,
          isHoldSelling: false,
          walletBalance: 500,
          createdAt: new Date().toISOString(),
          address: {
            line1: '123, Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            verified: true,
          },
        },
      });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
        wallet: {
          include: {
            txns: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        ipLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            listings: true,
            bookingsAsCustomer: true,
            bookingsAsSeller: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't expose sensitive data
    const safeUser = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      profileImage: user.profileImage,
      gender: user.gender,
      role: user.role,
      kycStatus: user.kycStatus,
      isBanned: user.isBanned,
      isHoldSelling: user.isHoldSelling,
      referralCode: user.referralCode,
      walletBalance: user.wallet?.balance || 0,
      createdAt: user.createdAt,
      address: user.address ? {
        line1: user.address.line1,
        line2: user.address.line2,
        city: user.address.city,
        state: user.address.state,
        pincode: user.address.pincode,
        verified: user.address.verified,
      } : null,
      _count: user._count,
    };

    return NextResponse.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me - Update current user
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
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
    const validationResult = updateUserSchema.safeParse(body);
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

    // Check if username is already taken
    if (data.username) {
      const existingUser = await db.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Update user with transaction
    const user = await db.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          displayName: data.displayName,
          username: data.username,
          profileImage: data.profileImage,
          gender: data.gender,
          role: data.role,
          updatedAt: new Date(),
        },
      });

      // Update or create address if provided
      if (data.address) {
        await tx.address.upsert({
          where: { userId },
          create: {
            userId,
            line1: data.address.line1,
            line2: data.address.line2,
            city: data.address.city,
            state: data.address.state,
            pincode: data.address.pincode,
            lat: data.address.lat,
            lng: data.address.lng,
            verified: false,
          },
          update: {
            line1: data.address.line1,
            line2: data.address.line2,
            city: data.address.city,
            state: data.address.state,
            pincode: data.address.pincode,
            lat: data.address.lat,
            lng: data.address.lng,
          },
        });
      }

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update
export async function PATCH(request: NextRequest) {
  return PUT(request);
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
