// components/notifications/NotificationListener.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addNotification,
  fetchUnreadCount,
} from "../../store/slices/notificationsSlice";
import { useToast } from "../ui/use-toast";
import type { Notification } from "../../api/notification.api";
import { useGlobalSocket } from "../../context/SocketContext";

export default function NotificationListener() {
  const dispatch = useAppDispatch();
  const { socket, isConnected } = useGlobalSocket();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  // Fetch initial notifications and unread count
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('🔄 Fetching initial notifications...');
    dispatch(fetchUnreadCount());
  }, [isAuthenticated, user, dispatch]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected || !isAuthenticated) {
      console.log('❌ Socket not ready for notifications:', { 
        socket: !!socket, 
        isConnected, 
        isAuthenticated 
      });
      return;
    }

    console.log('🎯 Setting up notification listeners...');

    // Listen for new notifications
    const handleNotification = (notification: Notification) => {
      console.log('📢 Received notification:', notification);
      
      dispatch(addNotification(notification));
      dispatch(fetchUnreadCount()); // Refresh unread count
      
      toast({
        title: notification.title,
        description: notification.content,
        duration: 5000,
        variant: "default",
      });
    };

    // Listen for notification updates
    const handleNotificationUpdate = (updatedNotification: Notification) => {
      console.log('🔄 Notification updated:', updatedNotification);
      // You might want to update existing notification in store
    };

    // Join user's notification room
    socket.emit('joinNotifications');

    socket.on("notification", handleNotification);
    socket.on("notificationUpdated", handleNotificationUpdate);

    return () => {
      console.log('🧹 Cleaning up notification listeners');
      socket.off("notification", handleNotification);
      socket.off("notificationUpdated", handleNotificationUpdate);
      socket.emit('leaveNotifications');
    };
  }, [socket, isConnected, isAuthenticated, dispatch, toast]);

  return null;
}