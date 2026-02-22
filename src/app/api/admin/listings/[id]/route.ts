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
  status: z.enum(['active', 'pending_review', 'paused', 'delisted']),
  reason: z.string().optional(),
});

// PATCH /api/admin/listings/[id] - Update listing status
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

    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const updated = await db.listing.update({
      where: { id },
      data: { status: validation.data.status },
      select: { id: true, title: true, status: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Listing status updated to ${updated.status}`,
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE /api/admin/listings/[id] - Permanently delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    await db.listing.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Listing permanently deleted',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete listing' }, { status: 500 });
  }
}
