import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Real-time Chat & Notifications Logic
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.data.username = data.username;
        socket.broadcast.emit('user-joined', {
            user: { id: socket.id, username: data.username },
            message: {
                id: crypto.randomUUID(),
                username: 'System',
                content: `${data.username} has joined the chat`,
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        });
    });

    socket.on('message', (data) => {
        io.emit('message', {
            id: crypto.randomUUID(),
            username: data.username,
            content: data.content,
            timestamp: new Date().toISOString(),
            type: 'user'
        });
    });

    socket.on('disconnect', () => {
        if (socket.data.username) {
            io.emit('user-left', {
                user: { id: socket.id, username: socket.data.username },
                message: {
                    id: crypto.randomUUID(),
                    username: 'System',
                    content: `${socket.data.username} has left the chat`,
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            });
        }
    });
});

// Error Handling
app.use(errorHandler);

export { httpServer, prisma, io };
