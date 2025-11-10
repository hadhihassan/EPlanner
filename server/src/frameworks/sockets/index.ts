import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../../frameworks/config/env.js';

let io: Server | null = null;

export const initSockets = (server: http.Server) => {
  io = new Server(server, { cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST'] } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, env.JWT_SECRET) as any;
      (socket as any).userId = payload.id;
      next();
    } catch (err: Error | any) {
      next(err);
    }
  });

  io.on('connection', socket => {
    console.log('socket connected', socket.id);
    socket.on('joinEvent', ({ eventId }) => {
      socket.join(`event:${eventId}`);
      io?.to(`event:${eventId}`).emit('presenceUpdate', { userId: (socket as any).userId, online: true });
    });

    socket.on('eventChatMessage', (payload) => {
      io?.to(`event:${payload.eventId}`).emit('newChatMessage', { ...payload, createdAt: new Date() });
    });

    socket.on('disconnect', () => { 
      console.log('socket disconnected', socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
