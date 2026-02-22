import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateListingSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(1000).optional(),
  category: z.string().optional(),
  gender: z.enum(['women', 'men', 'kids']).optional(),
  eventTags: z.array(z.string()).optional(),
  customTags: z.array(z.string()).optional(),
  size: z.string().optional(),
  measurements: z.object({
    waist: z.number().optional(),
    chest: z.number().optional(),
    length: z.number().optional(),
  }).optional(),
  color: z.string().optional(),
  fabric: z.string().optional(),
  condition: z.enum(['like_new', 'good', 'fair']).optional(),
  pricePerDay: z.number().positive().optional(),
  pricePerWeek: z.number().positive().optional(),
  deposit: z.number().min(100).optional(),
  deliveryType: z.enum(['pickup', 'delivery', 'both']).optional(),
  serviceRadius: z.number().min(1).max(100).optional(),
  deliveryCharge: z.number().min(0).optional(),
  status: z.enum(['draft', 'pending_review', 'active', 'paused', 'delisted']).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const validationResult = updateListingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify listing exists
    const existingListing = await db.listing.findUnique({ where: { id } });
    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Update transaction
    const updatedListing = await db.$transaction(async (tx) => {
      const listing = await tx.listing.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          gender: data.gender,
          eventTags: data.eventTags ? data.eventTags.join(',') : undefined,
          customTags: data.customTags ? data.customTags.join(',') : undefined,
          size: data.size,
          measurements: data.measurements ? JSON.stringify(data.measurements) : undefined,
          color: data.color,
          fabric: data.fabric,
          condition: data.condition,
          pricePerDay: data.pricePerDay,
          pricePerWeek: data.pricePerWeek,
          deposit: data.deposit,
          deliveryType: data.deliveryType,
          serviceRadius: data.serviceRadius,
          deliveryCharge: data.deliveryCharge,
          status: data.status,
        },
      });

      // Update images if provided
      if (data.images) {
        // Delete existing images
        await tx.listingImage.deleteMany({ where: { listingId: id } });

        // Create new images
        if (data.images.length > 0) {
          await tx.listingImage.createMany({
            data: data.images.map((url, index) => ({
              listingId: id,
              url,
              order: index,
            })),
          });
        }
      }

      return listing;
    });

    return NextResponse.json({
      success: true,
      data: updatedListing,
      message: 'Listing updated successfully',
    });

  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingListing = await db.listing.findUnique({ where: { id } });
    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    await db.listing.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
