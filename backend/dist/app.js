import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
const prisma = null;
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
// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Real-time Chat Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join', (data) => {
        socket.data.username = data.username;
        console.log(`${data.username} joined`);
        // Broadcast to others
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
        const msg = {
            id: crypto.randomUUID(),
            username: data.username,
            content: data.content,
            timestamp: new Date().toISOString(),
            type: 'user'
        };
        io.emit('message', msg);
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
        console.log('User disconnected:', socket.id);
    });
});
export { httpServer, prisma };
