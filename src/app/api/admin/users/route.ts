import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = request.headers.get('x-admin-token');
  const expectedToken = process.env.ADMIN_SECRET || 'admin-secret';
  return authHeader === `Bearer ${expectedToken}` || adminToken === expectedToken;
}

// GET /api/admin/users - Get all users for admin
export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const kycStatus = searchParams.get('kycStatus') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          email: true,
          phone: true,
          username: true,
          role: true,
          kycStatus: true,
          isBanned: true,
          isHoldSelling: true,
          createdAt: true,
          _count: {
            select: { listings: true, bookingsAsCustomer: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
