import { Server } from "socket.io";
import http from "http";
import { env } from "../config/env.js";
import { MongoMessageRepository } from "../../adapters/repositories/mongoMessage.repository.js";
import { JwtTokenService } from "../../adapters/services/jwtToken.service.js";

let io: Server | null = null;

const messageRepo = new MongoMessageRepository();
const tokenService = new JwtTokenService();

// GLOBAL online users — used for Participants list
const globalOnlineUsers = new Map();
// event-specific online users for chat
const onlineUsers = new Map();
const eventUsers = new Map();

export const initSockets = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));

      const payload = tokenService.verifyAccess(token);

      // FIX: correct assignment
      (socket as any).userId = payload.id;
      (socket as any).userData = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        avatarUrl: payload.avatarUrl,
        role: payload.role,
      };

      return next();
    } catch (err:any) {
      next(err);
    }
  });

  // ---------------- CONNECTION --------------------
  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    const userData = (socket as any).userData;

    socket.join(`user:${userId}`);

    globalOnlineUsers.set(userId, {
      socketId: socket.id,
      userData,
      lastSeen: new Date(),
    });

    onlineUsers.set(userId, {
      socketId: socket.id,
      events: new Set(),
      userData,
      lastSeen: new Date(),
    });

    broadcastGlobalOnlineUsers();

    // ---------------- NOTIFICATION ROOMS --------------------
    socket.on("joinNotifications", () => {
      socket.join(`user:${userId}`);
    });

    socket.on("leaveNotifications", () => {
      socket.leave(`user:${userId}`);
    });

    // ---------------- JOIN EVENT --------------------
    socket.on("joinEvent", async ({ eventId }) => {
      socket.join(`event:${eventId}`);

      if (!eventUsers.has(eventId)) {
        eventUsers.set(eventId, new Set());
      }

      eventUsers.get(eventId).add(userId);

      const userSession = onlineUsers.get(userId);
      if (userSession) userSession.events.add(eventId);

      // send history
      const history = await messageRepo.listByEvent(eventId);
      socket.emit("chatHistory", history);

      // send event online users
      io?.to(`event:${eventId}`).emit(
        "eventOnlineUsers",
        getOnlineUsersForEvent(eventId)
      );
    });

    // ---------------- CHAT MESSAGE --------------------
    socket.on("eventChatMessage", async ({ eventId, text }) => {
      if (!text?.trim()) return;

      const saved = await messageRepo.create({
        eventId,
        userId,
        text,
      });

      io?.to(`event:${eventId}`).emit("newChatMessage", saved);
    });

    // ---------------- LEAVE EVENT --------------------
    socket.on("leaveEvent", ({ eventId }) => {
      socket.leave(`event:${eventId}`);

      if (eventUsers.has(eventId)) {
        eventUsers.get(eventId).delete(userId);
      }

      io?.to(`event:${eventId}`).emit(
        "eventOnlineUsers",
        getOnlineUsersForEvent(eventId)
      );
    });

    // ---------------- DISCONNECT --------------------
    socket.on("disconnect", () => {

      const userSession = onlineUsers.get(userId);
      if (userSession) {
        [...userSession.events].forEach((eventId) => {
          eventUsers.get(eventId)?.delete(userId);

          io?.to(`event:${eventId}`).emit(
            "eventOnlineUsers",
            getOnlineUsersForEvent(eventId)
          );
        });
      }

      globalOnlineUsers.delete(userId);
      onlineUsers.delete(userId);

      broadcastGlobalOnlineUsers();
    });
  });

  return io;
};

// ---------------- HELPERS --------------------

function broadcastGlobalOnlineUsers() {
  io?.emit(
    "globalOnlineUsers",
    [...globalOnlineUsers.entries()].map(([userId, data]) => ({
      userId,
      userData: data.userData,
      lastSeen: data.lastSeen,
    }))
  );
}

function getOnlineUsersForEvent(eventId:string) {
  if (!eventUsers.has(eventId)) return [];

  return [...eventUsers.get(eventId)]
    .map((userId) => onlineUsers.get(userId))
    .filter(Boolean)
    .map((s) => ({
      userId: s.userData.id,
      userData: s.userData,
      lastSeen: s.lastSeen,
    }));
}

export const getIO = () => io;