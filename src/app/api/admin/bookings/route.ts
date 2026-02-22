import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = request.headers.get('x-admin-token');
  const expectedToken = process.env.ADMIN_SECRET || 'admin-secret';
  return authHeader === `Bearer ${expectedToken}` || adminToken === expectedToken;
}

// GET /api/admin/bookings - Get all bookings for admin
export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { listing: { title: { contains: search } } },
        { customer: { displayName: { contains: search } } },
        { seller: { displayName: { contains: search } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      db.booking.count({ where }),
      db.booking.findMany({
        where,
        include: {
          listing: { select: { id: true, title: true } },
          customer: { select: { id: true, displayName: true } },
          seller: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

const patchSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum([
    'initiated', 'deposit_paid', 'otp_pending', 'otp_verified',
    'rented', 'return_initiated', 'returned', 'deposit_released', 'cancelled',
  ]),
});

// PATCH /api/admin/bookings - Update booking status (admin override)
export async function PATCH(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId, status } = validation.data;

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}
