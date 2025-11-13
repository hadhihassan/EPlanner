import { Server } from 'socket.io';
import http from 'http';
import { env } from '../config/env.js';
import { MongoMessageRepository } from '../../adapters/repositories/mongoMessage.repository.js';
import { JwtTokenService } from '../../adapters/services/jwtToken.service.js';

let io: Server | null = null;
const messageRepo = new MongoMessageRepository();
const tokenService = new JwtTokenService();

// Store online users and their events
const onlineUsers = new Map(); // userId: { socketId, events: Set, userData }
const eventUsers = new Map(); // eventId: Set of userIds
const globalOnlineUsers = new Map();

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

      const payload = tokenService.verifyAccess(token) as any;
      (socket as any).userId = payload.id;
      (socket as any).userData = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar,
        role: payload.role
      };

      next();
    } catch (err: any) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const userData = (socket as any).userData;

    console.log(`🔌 ${userId} connected as ${socket.id}`);

    // Add to global online users
    globalOnlineUsers.set(userId, {
      socketId: socket.id,
      userData: userData,
      lastSeen: new Date()
    });

    // Add to event-specific online users (your existing code)
    onlineUsers.set(userId, {
      socketId: socket.id,
      events: new Set(),
      userData: userData,
      lastSeen: new Date()
    });

    // Broadcast both global and event-specific online users
    broadcastGlobalOnlineUsers();
    broadcastOnlineUsers();

    socket.on('joinEvent', async ({ eventId }) => {
      try {
        const room = `event:${eventId}`;
        await socket.join(room);

        // Track user's events
        const user = onlineUsers.get(userId);
        if (user) {
          user.events.add(eventId);
        }

        // Track event users
        if (!eventUsers.has(eventId)) {
          eventUsers.set(eventId, new Set());
        }
        eventUsers.get(eventId).add(userId);

        console.log(`User ${userId} joined event ${eventId}`);
        console.log('Event users:', Array.from(eventUsers.get(eventId) || []));

        // Send chat history
        const history = await messageRepo.listByEvent(eventId);
        socket.emit('chatHistory', history);

        // Send current online users for this event
        const onlineEventUsers = getOnlineUsersForEvent(eventId);
        socket.emit('eventOnlineUsers', onlineEventUsers);

        broadcastGlobalOnlineUsers();
        io?.to(`event:${eventId}`).emit('eventOnlineUsers', onlineEventUsers);

        // Notify others about new user
        socket.to(room).emit('presenceUpdate', {
          userId,
          online: true,
          userData: userData,
          action: 'joined'
        });

        // Broadcast updated online users for this event
        io?.to(room).emit('eventOnlineUsers', onlineEventUsers);

        // Broadcast updated online users list
        broadcastOnlineUsers();
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

      // Remove from tracking
      const user = onlineUsers.get(userId);
      if (user) {
        user.events.delete(eventId);
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

      // Broadcast updated online users list
      broadcastOnlineUsers();
    });


    socket.on('disconnect', () => {
      // Remove from both maps
      globalOnlineUsers.delete(userId);
      onlineUsers.delete(userId);

      // Broadcast updates
      broadcastGlobalOnlineUsers();
      broadcastOnlineUsers();
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

function broadcastOnlineUsersCount() {
  const onlineCount = onlineUsers.size;
  io?.emit('onlineUsersCount', { count: onlineCount });
}

// Utility functions
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.entries()).map(([userId, data]) => ({
    userId,
    userData: data.userData,
    lastSeen: data.lastSeen,
    events: Array.from(data.events)
  }));
};

export const getEventOnlineUsers = (eventId: string) => {
  return getOnlineUsersForEvent(eventId);
};

// Broadcast all globally online users
function broadcastGlobalOnlineUsers() {
  const globalUsersList = Array.from(globalOnlineUsers.entries()).map(([userId, data]) => ({
    userId,
    userData: data.userData,
    lastSeen: data.lastSeen
  }));

  io?.emit('globalOnlineUsers', globalUsersList);
}

// Your existing function for event-specific online users
function broadcastOnlineUsers() {
  const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
    userId,
    userData: data.userData,
    lastSeen: data.lastSeen,
    events: Array.from(data.events)
  }));

  io?.emit('onlineUsers', onlineUsersList);
}

export const getIO = () => io;