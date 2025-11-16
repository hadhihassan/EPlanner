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

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('🔄 Fetching initial notifications...');
    dispatch(fetchUnreadCount());
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (!socket || !isConnected || !isAuthenticated) {
      return;
    }


    const handleNotification = (notification: Notification) => {
      
      dispatch(addNotification(notification));
      dispatch(fetchUnreadCount()); 
      
      toast({
        title: notification.title,
        description: notification.content,
        duration: 5000,
        variant: "success",
      });
    };

    const handleNotificationUpdate = (updatedNotification: Notification) => {
      console.log('Notification updated:', updatedNotification);
    };

    socket.emit('joinNotifications');

    socket.on("notification", handleNotification);
    socket.on("notificationUpdated", handleNotificationUpdate);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("notificationUpdated", handleNotificationUpdate);
      socket.emit('leaveNotifications');
    };
  }, [socket, isConnected, isAuthenticated, dispatch, toast]);

  return null;
}