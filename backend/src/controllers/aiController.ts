import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import ZAI from 'z-ai-web-dev-sdk';
import { AppError } from '../middleware/errorHandler.js';

export const outfitConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { prompt, gender, occasion } = req.body;

        if (!prompt) return next(new AppError('Prompt is required', 400));

        const zai = await ZAI.create();

        const systemPrompt = `You are a professional fashion stylist and outfit consultant for ShahidRa Rentals. 
    Provide expert advice for ${gender || 'all'} genders, specifically for the occasion: ${occasion || 'any'}.
    Recommend specific styles, color combinations, and accessory ideas.`;

        const completion = await zai.chat.completions.create({
            messages: [
                { role: 'assistant', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            thinking: { type: 'disabled' }
        });

        res.status(200).json({
            status: 'success',
            data: {
                advice: completion.choices[0]?.message?.content
            }
        });
    } catch (error: any) {
        next(new AppError(error.message, 500));
    }
};

export const outfitVisualizer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { description, style = 'professional product photography' } = req.body;

        if (!description) return next(new AppError('Description is required', 400));

        const zai = await ZAI.create();

        const fullPrompt = `${description}, ${style}, high quality, detailed, fashion marketplace style`;

        const response = await zai.images.generations.create({
            prompt: fullPrompt,
            size: '1024x1024'
        });

        res.status(200).json({
            status: 'success',
            data: {
                imageBase64: response.data[0].base64
            }
        });
    } catch (error: any) {
        next(new AppError(error.message, 500));
    }
};

export const autoDescriber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, category, features } = req.body;

        if (!title) return next(new AppError('Title is required', 400));

        const zai = await ZAI.create();

        const prompt = `Generate a compelling, high-end product description for an outfit rental listing.
    Title: ${title}
    Category: ${category}
    Features: ${features || 'Premium quality'}
    
    Make it sound luxurious and enticing for a fashion marketplace.`;

        const completion = await zai.chat.completions.create({
            messages: [
                { role: 'assistant', content: 'You are a professional copywriter for a high-end fashion rental platform.' },
                { role: 'user', content: prompt }
            ],
            thinking: { type: 'disabled' }
        });

        res.status(200).json({
            status: 'success',
            data: {
                description: completion.choices[0]?.message?.content
            }
        });
    } catch (error: any) {
        next(new AppError(error.message, 500));
    }
};
