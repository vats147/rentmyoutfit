import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalListings = await prisma.listing.count();
        const totalBookings = await prisma.booking.count();

        // Simple revenue calculation (sum of platform fees)
        const revenue = await prisma.booking.aggregate({
            _sum: {
                platformFee: true
            },
            where: {
                status: { in: ['rented', 'completed', 'verified'] }
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalUsers,
                    totalListings,
                    totalBookings,
                    revenue: revenue._sum.platformFee || 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { listings: true, bookingsAsCustomer: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: { users }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { isBanned, banReason, role } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { isBanned, banReason, role }
        });

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingListings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const listings = await prisma.listing.findMany({
            where: { status: 'draft' }, // Assuming draft or a 'pending' state needs approval
            include: {
                seller: { select: { displayName: true, email: true } },
                images: true
            }
        });

        res.status(200).json({
            status: 'success',
            data: { listings }
        });
    } catch (error) {
        next(error);
    }
};
