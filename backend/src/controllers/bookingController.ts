import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { listingId, startDate, endDate } = req.body;

        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) return next(new AppError('Listing not found', 404));

        if (listing.sellerId === req.user.id) {
            return next(new AppError('You cannot book your own listing', 400));
        }

        // Check availability
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                listingId,
                status: { in: ['deposit_paid', 'rented'] },
                OR: [
                    { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }
                ]
            }
        });

        if (conflictingBooking) {
            return next(new AppError('Listing is not available for selected dates', 400));
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

        const rentalAmount = listing.pricePerDay * days;
        const platformFee = rentalAmount * 0.1; // 10% fee

        const booking = await prisma.booking.create({
            data: {
                listingId,
                customerId: req.user.id,
                sellerId: listing.sellerId,
                startDate: start,
                endDate: end,
                rentalAmount,
                depositAmount: listing.deposit,
                platformFee,
                totalPaid: rentalAmount + listing.deposit + platformFee,
                status: 'initiated'
            }
        });

        res.status(201).json({
            status: 'success',
            data: { booking }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    { customerId: req.user.id },
                    { sellerId: req.user.id }
                ]
            },
            include: {
                listing: {
                    include: { images: true }
                },
                customer: { select: { displayName: true, profileImage: true } },
                seller: { select: { displayName: true, profileImage: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: { bookings }
        });
    } catch (error) {
        next(error);
    }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { listing: true }
        });

        if (!booking) return next(new AppError('Booking not found', 404));

        // Simple permission check
        const isSeller = booking.sellerId === req.user.id;
        const isCustomer = booking.customerId === req.user.id;

        if (!isSeller && !isCustomer) return next(new AppError('Not authorized', 403));

        // Status transition logic
        const updatedBooking = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status }
        });

        // Generate OTP if needed
        if (status === 'otp_pending') {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            await prisma.booking.update({
                where: { id: req.params.id },
                data: { pickupOtp: otp }
            });
        }

        res.status(200).json({
            status: 'success',
            data: { booking: updatedBooking }
        });
    } catch (error) {
        next(error);
    }
};
