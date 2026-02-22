import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllListings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, gender, minPrice, maxPrice, status = 'active' } = req.query;

        const filter: any = {
            status: status as string
        };

        if (category) filter.category = category as string;
        if (gender) filter.gender = gender as string;
        if (minPrice || maxPrice) {
            filter.pricePerDay = {
                gte: minPrice ? parseFloat(minPrice as string) : 0,
                lte: maxPrice ? parseFloat(maxPrice as string) : 1000000
            };
        }

        const listings = await prisma.listing.findMany({
            where: filter,
            include: {
                images: true,
                seller: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        profileImage: true
                    }
                },
                _count: {
                    select: { reviews: true, bookings: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            results: listings.length,
            data: { listings }
        });
    } catch (error) {
        next(error);
    }
};

export const getListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id },
            include: {
                images: true,
                videos: true,
                seller: true,
                reviews: {
                    include: { author: true }
                }
            }
        });

        if (!listing) {
            return next(new AppError('No listing found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { listing }
        });
    } catch (error) {
        next(error);
    }
};

export const createListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, category, gender, pricePerDay, deposit, images } = req.body;

        const newListing = await prisma.listing.create({
            data: {
                title,
                description,
                category,
                gender,
                pricePerDay: parseFloat(pricePerDay),
                deposit: parseFloat(deposit),
                sellerId: req.user.id,
                status: 'active', // Should ideally be pending_review
                images: {
                    create: images?.map((url: string, index: number) => ({
                        url,
                        order: index
                    })) || []
                }
            },
            include: { images: true }
        });

        res.status(201).json({
            status: 'success',
            data: { listing: newListing }
        });
    } catch (error) {
        next(error);
    }
};

export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

        if (!listing) return next(new AppError('No listing found', 404));
        if (listing.sellerId !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('Not authorized', 403));
        }

        const updatedListing = await prisma.listing.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.status(200).json({
            status: 'success',
            data: { listing: updatedListing }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

        if (!listing) return next(new AppError('No listing found', 404));
        if (listing.sellerId !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('Not authorized', 403));
        }

        await prisma.listing.delete({ where: { id: req.params.id } });

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
