import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Simple admin auth check (in production, use proper JWT/session)
function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = request.headers.get('x-admin-token');
  const expectedToken = process.env.ADMIN_SECRET || 'admin-secret';
  // For demo, accept a simple token
  // In production, verify JWT or session
  return authHeader === `Bearer ${expectedToken}` || adminToken === expectedToken;
}

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all stats in parallel for performance
    const [
      totalUsers,
      activeListings,
      totalBookings,
      pendingReviews,
      openDisputes,
      totalRevenue,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count({ where: { status: 'active' } }),
      db.booking.count(),
      db.listing.count({ where: { status: 'pending_review' } }),
      db.dispute.count({ where: { status: 'open' } }),
      db.transaction.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, displayName: true, email: true, createdAt: true },
      }),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { title: true } },
          customer: { select: { displayName: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeListings,
          totalBookings,
          pendingReviews,
          openDisputes,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        recent: {
          users: recentUsers,
          bookings: recentBookings,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// User management actions
const userActionSchema = z.object({
  action: z.enum(['ban', 'unban', 'hold_selling', 'release_hold', 'verify_kyc']),
  userId: z.string().min(1),
  reason: z.string().optional(),
  duration: z.enum(['temporary', 'permanent']).optional(),
});

// PATCH /api/admin/users - Manage users
export async function PATCH(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const validationResult = userActionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { action, userId, reason, duration } = validationResult.data;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'ban':
        updateData = {
          isBanned: true,
          banReason: reason || 'Banned by admin',
        };
        break;
      case 'unban':
        updateData = {
          isBanned: false,
          banReason: null,
        };
        break;
      case 'hold_selling':
        updateData = { isHoldSelling: true };
        break;
      case 'release_hold':
        updateData = { isHoldSelling: false };
        break;
      case 'verify_kyc':
        updateData = { kycStatus: 'verified' };
        break;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        isBanned: updatedUser.isBanned,
        isHoldSelling: updatedUser.isHoldSelling,
        kycStatus: updatedUser.kycStatus,
      },
      message: `User ${action.replace('_', ' ')} successfully`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Listing management actions
const listingActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'pause', 'activate', 'delist']),
  listingId: z.string().min(1),
  reason: z.string().optional(),
});

// PUT /api/admin/listings - Manage listings
export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const validationResult = listingActionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { action, listingId, reason } = validationResult.data;

    const listing = await db.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    let newStatus = listing.status;
    
    switch (action) {
      case 'approve':
        newStatus = 'active';
        break;
      case 'reject':
      case 'delist':
        newStatus = 'delisted';
        break;
      case 'pause':
        newStatus = 'paused';
        break;
      case 'activate':
        newStatus = 'active';
        break;
    }

    const updatedListing = await db.listing.update({
      where: { id: listingId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedListing.id,
        title: updatedListing.title,
        status: updatedListing.status,
      },
      message: `Listing ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}
