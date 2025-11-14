import { Server } from 'socket.io';
import http from 'http';
import { env } from '../config/env.js';
import { MongoMessageRepository } from '../../adapters/repositories/mongoMessage.repository.js';
import { JwtTokenService } from '../../adapters/services/jwtToken.service.js';

let io: Server | null = null;
const messageRepo = new MongoMessageRepository();
const tokenService = new JwtTokenService();

// Store ALL online users globally
const globalOnlineUsers = new Map(); // userId: { socketId, userData, lastSeen }

// Store event-specific users (for chat)
const onlineUsers = new Map(); // userId: { socketId, events: Set, userData }
const eventUsers = new Map(); // eventId: Set of userIds

export const initSockets = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));

      console.log('token', token)
      const payload = tokenService.verifyAccess(token);
      (socket as any).id = payload.id;
      (socket as any).userData = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar,
        role: payload.role
      };
      console.log(payload)
      next();
    } catch (err: any) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    console.log(socket)
    const userId = (socket as any).userId;
    const userData = (socket as any).userData;

    console.log(`🔌 ${userId} connected as ${socket.id}`);

    // Join user's notification room
    socket.join(`user:${userId}`);

    // Add to GLOBAL online users (for participant list)
    globalOnlineUsers.set(userId, {
      socketId: socket.id,
      userData: userData,
      lastSeen: new Date()
    });

    // Add to event-specific online users (for chat)
    onlineUsers.set(userId, {
      socketId: socket.id,
      events: new Set(),
      userData: userData,
      lastSeen: new Date()
    });

    // Broadcast GLOBAL online users to ALL clients
    broadcastGlobalOnlineUsers();

    socket.on('joinEvent', async ({ eventId }) => {
      try {
        const room = `event:${eventId}`;
        await socket.join(room);

        // Track user's events
        const user = onlineUsers.get(userId);
        if (user) {
          user.events.add(eventId);
          user.lastSeen = new Date();
        }

        // Track event users
        if (!eventUsers.has(eventId)) {
          eventUsers.set(eventId, new Set());
        }
        eventUsers.get(eventId).add(userId);

        console.log(`User ${userId} joined event ${eventId}`);

        // Send chat history
        const history = await messageRepo.listByEvent(eventId);
        socket.emit('chatHistory', history);

        // Send current online users for this event (for chat)
        const onlineEventUsers = getOnlineUsersForEvent(eventId);
        socket.emit('eventOnlineUsers', onlineEventUsers);

        // Notify others about new user
        socket.to(room).emit('presenceUpdate', {
          userId,
          online: true,
          userData: userData,
          action: 'joined'
        });

        // Broadcast updated online users for this event
        io?.to(room).emit('eventOnlineUsers', onlineEventUsers);

      } catch (error) {
        console.error('Error in joinEvent:', error);
      }
    });

    socket.on('eventChatMessage', async (payload) => {
      try {
        const { eventId, text } = payload;
        if (!text?.trim()) return;

        console.log(`💬 User ${userId} sending message to event ${eventId}`);

        const saved = await messageRepo.create({
          eventId,
          userId,
          text
        });

        console.log('✅ Message saved:', saved);

        // Emit to all users in the event room
        io?.to(`event:${eventId}`).emit('newChatMessage', saved);

      } catch (error) {
        console.error('Error in eventChatMessage:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ eventId, isTyping }) => {
      socket.to(`event:${eventId}`).emit('userTyping', {
        userId,
        isTyping,
        userData
      });
    });

    socket.on('leaveEvent', ({ eventId }) => {
      const room = `event:${eventId}`;
      socket.leave(room);

      // Remove from event tracking
      const user = onlineUsers.get(userId);
      if (user) {
        user.events.delete(eventId);
        user.lastSeen = new Date();
      }

      if (eventUsers.has(eventId)) {
        eventUsers.get(eventId).delete(userId);
      }

      socket.to(room).emit('presenceUpdate', {
        userId,
        online: false,
        userData: userData,
        action: 'left'
      });

      // Broadcast updated online users for this event
      const onlineEventUsers = getOnlineUsersForEvent(eventId);
      io?.to(room).emit('eventOnlineUsers', onlineEventUsers);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${userId} disconnected`);

      // Get all events this user was in before removing
      const userEvents = onlineUsers.get(userId)?.events || new Set();

      // Remove from BOTH global and event-specific tracking
      globalOnlineUsers.delete(userId);
      onlineUsers.delete(userId);

      // Remove from all event user lists
      userEvents.forEach(eventId => {
        if (eventUsers.has(eventId)) {
          eventUsers.get(eventId).delete(userId);

          // Notify event room about user leaving
          io?.to(`event:${eventId}`).emit('presenceUpdate', {
            userId,
            online: false,
            userData: userData,
            action: 'left'
          });

          // Broadcast updated online users for this event
          const onlineEventUsers = getOnlineUsersForEvent(eventId);
          io?.to(`event:${eventId}`).emit('eventOnlineUsers', onlineEventUsers);
        }
      });

      // Broadcast updated GLOBAL online users to ALL clients
      broadcastGlobalOnlineUsers();
    });
  });

  return io;
};

// Helper functions
function getOnlineUsersForEvent(eventId: string) {
  if (!eventUsers.has(eventId)) return [];

  const userIds = Array.from(eventUsers.get(eventId));
  return userIds.map(userId => {
    const user = onlineUsers.get(userId);
    return user ? {
      userId,
      userData: user.userData,
      lastSeen: user.lastSeen,
      socketId: user.socketId
    } : null;
  }).filter(Boolean);
}

// Broadcast ALL globally online users to EVERY client
function broadcastGlobalOnlineUsers() {
  const globalUsersList = Array.from(globalOnlineUsers.entries()).map(([userId, data]) => ({
    userId,
    userData: data.userData,
    lastSeen: data.lastSeen
  }));

  io?.emit('globalOnlineUsers', globalUsersList);
}

// Utility functions
export const getOnlineUsers = () => {
  return Array.from(globalOnlineUsers.entries()).map(([userId, data]) => ({
    userId,
    userData: data.userData,
    lastSeen: data.lastSeen
  }));
};

export const getEventOnlineUsers = (eventId: string) => {
  return getOnlineUsersForEvent(eventId);
};

export const getIO = () => io;