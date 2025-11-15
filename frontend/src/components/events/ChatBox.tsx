import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Button } from "../ui/Button";
import Input from "../ui/Input";
import { useToast } from "../ui/use-toast";
import {
  setMessages,
  addMessage,
  clearChat,
  selectMessagesByEvent,
} from "../../store/slices/chatSlice";
import type { IMessage } from "../../types/message.types";
import { DateFormatter } from "../../utils/dateFormator";
import { palette } from "./constants";
import { useGlobalSocket } from "../../context/SocketContext";

interface Props {
  eventId: string;
}

export default function ChatBox({ eventId }: Props) {
  const dispatch = useAppDispatch();
  const { socket, isConnected } = useGlobalSocket();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const user = useAppSelector((s) => s.auth.user);
  const hasJoinedRef = useRef(false);
  const { toast } = useToast();

  const messages = useAppSelector(selectMessagesByEvent(eventId));

  const handleChatHistory = useCallback(
    (history: IMessage[]) => {
      dispatch(setMessages({ eventId, messages: history || [] }));
    },
    [eventId, dispatch]
  );

  const handleNewMessage = useCallback(
    (msg: IMessage) => {
      dispatch(addMessage({ eventId, message: msg }));
    },
    [eventId, dispatch]
  );

  const handleConnect = useCallback(() => {
    if (socket && !hasJoinedRef.current) {
      socket.emit("joinEvent", { eventId });
      hasJoinedRef.current = true;
    }
  }, [eventId, socket]);

  const handleDisconnect = useCallback(() => {
    hasJoinedRef.current = false;
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chatHistory", handleChatHistory);
    socket.on("newChatMessage", handleNewMessage);

    if (socket.connected && !hasJoinedRef.current) {
      socket.emit("joinEvent", { eventId });
      hasJoinedRef.current = true;
    }

    return () => {
      if (socket && hasJoinedRef.current) {
        socket.emit("leaveEvent", { eventId });
        hasJoinedRef.current = false;
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chatHistory", handleChatHistory);
      socket.off("newChatMessage", handleNewMessage);

      dispatch(clearChat({ eventId }));
    };
  }, [
    socket,
    eventId,
    handleConnect,
    handleDisconnect,
    handleChatHistory,
    handleNewMessage,
    dispatch,
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !socket.connected) {
      toast({
        title: "Connection error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    socket.emit("eventChatMessage", { eventId, text });
    setText("");
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
    if (!userId && !name) return "bg-gray-400";
    const hash = [...(userId || name || "default")].reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );
    return palette[hash % palette.length];
  };

  return (
    <div className="flex flex-col h-[480px] bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* Header with connection status */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">Event Chat</h3>
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}
          ></div>
        </div>
        <div className="text-blue-100 text-sm">
          {isConnected ? "Connected" : "Connecting..."}
        </div>
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
                      {isOwn(m)
                        ? "You"
                        : m.user?.name || m.user?.email || "Unknown User"}
                    </span>
                    <span>
                      {DateFormatter.formatMessageTimestamp(m.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn(m)
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1"
          disabled={!isConnected}
        />

        <Button
          onClick={sendMessage}
          disabled={!text.trim() || !isConnected}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
