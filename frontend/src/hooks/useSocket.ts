import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function useSocket(token?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only create socket if we have a token and don't already have a socket
    if (!token || socketRef.current) {
      return;
    }

    console.log('🔌 Creating new socket connection');

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      auth: { 
        token 
      },
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 9000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      console.log('🧹 Cleaning up socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [token]);

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('❌ Socket not connected, cannot emit:', event);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  return {
    socket: socketRef.current,
    emit,
    disconnect,
    isConnected,
  };
}