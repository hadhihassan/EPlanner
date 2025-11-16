import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null, 
  isConnected: false 
});

interface SocketProviderProps {
  token: string | null;
  children: ReactNode;
}

export function SocketProvider({ token, children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      console.log('No token available for socket connection');
      return;
    }

    console.log('Initializing socket connection...');
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      transports: ["websocket", "polling"],
      auth: { 
        token,
        userId: getUserIdFromToken(token) // Add this helper
      }
    });

    s.on("connect", () => {
      console.log('✅ Socket connected successfully');
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    s.on("connect_error", (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(s);

    return () => {
      console.log('Cleaning up socket connection');
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Helper function to extract user ID from token
function getUserIdFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || '';
  } catch {
    return '';
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalSocket = () => useContext(SocketContext);