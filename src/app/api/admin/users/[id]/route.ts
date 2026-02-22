import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = request.headers.get('x-admin-token');
  const expectedToken = process.env.ADMIN_SECRET || 'admin-secret';
  return authHeader === `Bearer ${expectedToken}` || adminToken === expectedToken;
}

const patchSchema = z.object({
  action: z.enum(['ban', 'unban', 'hold_selling', 'release_hold', 'verify_kyc']),
  reason: z.string().optional(),
});

// PATCH /api/admin/users/[id] - Perform admin action on a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { action, reason } = validation.data;
    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'ban':
        updateData = { isBanned: true, banReason: reason || 'Banned by admin' };
        break;
      case 'unban':
        updateData = { isBanned: false, banReason: null };
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

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        displayName: true,
        isBanned: true,
        isHoldSelling: true,
        kycStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `User action "${action.replace('_', ' ')}" applied successfully`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
