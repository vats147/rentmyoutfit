import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-shahidra';
const JWT_EXPIRES_IN = '90d';

const signToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user.id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, displayName, phone, role } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {
            return next(new AppError('User already exists with this email or phone', 400));
        }

        // Note: Prisma schema doesn't have a password field, but for demo we'll simulate logic
        // In a real app, you'd add password/hash fields to User model
        const newUser = await prisma.user.create({
            data: {
                email,
                displayName,
                phone,
                role: role || 'customer',
            }
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return next(new AppError('Please provide email or phone', 400));
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || 'never-match' },
                    { phone: phone || 'never-match' }
                ]
            }
        });

        if (!user) {
            return next(new AppError('No user found with these credentials', 401));
        }

        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: req.body
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        next(error);
    }
};
