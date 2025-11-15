import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  fetchUnreadCount,
  selectAllNotifications,
  selectUnreadCount,
  selectNotificationsLoading
} from '../../store/slices/notificationsSlice';
import { formatDistanceToNow } from 'date-fns';
import { FiCheck, FiTrash2, FiBell } from 'react-icons/fi';
import Spinner from '../../components/ui/Spinner';
import {Button} from '../../components/ui/Button';

export default function NotificationsPanel() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectAllNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const loading = useAppSelector(selectNotificationsLoading);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    dispatch(fetchNotifications({ read: filter === 'unread' ? false : undefined }));
    dispatch(fetchUnreadCount());
  }, [dispatch, filter]);

  const handleMarkAsRead = async (id: string) => {
    await dispatch(markAsRead(id));
    dispatch(fetchUnreadCount());
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
    dispatch(fetchUnreadCount());
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteNotification(id));
    dispatch(fetchUnreadCount());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_reminder':
        return '🔔';
      case 'event_created':
        return '➕';
      case 'event_updated':
        return '✏️';
      case 'event_deleted':
        return '🗑️';
      case 'daily_digest':
        return '📅';
      case 'user_added':
        return '👤';
      default:
        return '🔔';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'all' ? 'Show Unread' : 'Show All'}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <FiCheck className="mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiBell className="mx-auto text-4xl mb-4 opacity-50" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FiCheck className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
