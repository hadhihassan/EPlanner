import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Send } from "lucide-react";
import { Socket } from "socket.io-client";
import { useAppSelector } from "../../store/hooks";
import { Button } from "../ui/Button";
import Input from "../ui/Input";
import { Badge } from "../ui/badge";
import type { IMessage } from "../../types/message.types";
import { DateFormatter } from "../../utils/dateFormator";

interface Props {
  eventId: string;
  socket: Socket | null;
}

export default function ChatBox({ eventId, socket }: Props) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const user = useAppSelector((s) => s.auth.user);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const hasJoinedRef = useRef(false);

  // Memoized event handlers
  const handleChatHistory = useCallback((history: IMessage[]) => {
    console.log("📜 Chat history received:", history);
    setMessages(history || []);
  }, []);

  const handleNewMessage = useCallback((msg: IMessage) => {
    console.log("💬 New message received:", msg);
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleUserTyping = useCallback((data: { userId: string; isTyping: boolean; userData?: any }) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      if (data.isTyping) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });
  }, []);

  const handleConnect = useCallback(() => {
    console.log("✅ ChatBox: Socket connected");
    setIsConnected(true);

    if (socket && !hasJoinedRef.current) {
      console.log("🎯 Joining event:", eventId);
      socket.emit("joinEvent", { eventId });
      hasJoinedRef.current = true;
    }
  }, [eventId, socket]);

  const handleDisconnect = useCallback(() => {
    console.log("❌ ChatBox: Socket disconnected");
    setIsConnected(false);
    hasJoinedRef.current = false;
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log("❌ No socket available in ChatBox");
      return;
    }

    console.log("🔌 Setting up socket listeners for event:", eventId);

    // Set up listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chatHistory", handleChatHistory);
    socket.on("newChatMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);

    // If already connected, join event
    if (socket.connected && !hasJoinedRef.current) {
      console.log("🎯 Socket already connected, joining event:", eventId);
      socket.emit("joinEvent", { eventId });
      hasJoinedRef.current = true;
    }

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up ChatBox socket listeners for event:", eventId);

      if (socket && hasJoinedRef.current) {
        socket.emit("leaveEvent", { eventId });
        hasJoinedRef.current = false;
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chatHistory", handleChatHistory);
      socket.off("newChatMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, eventId, handleConnect, handleDisconnect, handleChatHistory, handleNewMessage, handleUserTyping]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!socket || !socket.connected) return;

    socket.emit("typing", { eventId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { eventId, isTyping: false });
    }, 1000);
  };

  const sendMessage = () => {
    if (!socket || !socket.connected) {
      console.error("❌ Cannot send message: Socket not connected");
      return;
    }

    if (!text.trim()) {
      console.warn("⚠️ Cannot send empty message");
      return;
    }

    console.log("📤 Sending message:", text);
    socket.emit("eventChatMessage", { eventId, text });
    setText("");

    socket.emit("typing", { eventId, isTyping: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOwn = (m: IMessage) => m.userId === (user?.id || user?._id);

  const getInitials = (name?: string, email?: string): string => {
    if (!name && !email) return "U";
    const parts = (name || email || "").split(" ").filter(Boolean).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  };

  const getUserColor = (userId: string | undefined, name?: string) => {
    const palette = [
      "bg-blue-500",
      "bg-green-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-rose-500",
      "bg-amber-500",
    ];
    if (!userId && !name) return "bg-gray-400";
    const hash = [...(userId || name || "default")].reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );
    return palette[hash % palette.length];
  };

  const typingUsersArray = Array.from(typingUsers);

  return (
    <div className="flex flex-col h-[480px] bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">Event Chat</h3>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white">
          {messages.length} messages
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={m.id || `msg-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${isOwn(m) ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold text-white border shadow-sm ${getUserColor(
                    m.user?.id,
                    m.user?.name
                  )}`}
                >
                  {getInitials(m.user?.name, m.user?.email)}
                </div>

                <div
                  className={`max-w-[70%] flex flex-col ${isOwn(m) ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {isOwn(m) ? "You" : m.user?.name || m.user?.email || "Unknown User"}
                    </span>
                    <span>
                      {DateFormatter.formatMessageTimestamp(m.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn(m)
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {typingUsersArray.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-gray-500 italic mt-2"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
            <span>
              {typingUsersArray.length === 1
                ? "Someone is typing..."
                : `${typingUsersArray.length} people are typing...`}
            </span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Paperclip className="w-4 h-4" />
        </Button>

        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 outline-none"
          disabled={!isConnected}
        />

        <Button
          onClick={sendMessage}
          disabled={!text.trim() || !isConnected}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  );
}