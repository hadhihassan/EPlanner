import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { notificationApi, type Notification } from '../../api/notification.api';
import type { RootState } from '../index';
import { isAxiosError } from 'axios';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error?: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const fetchNotifications = createAsyncThunk('notifications/list', async (filters?: { read?: boolean; page?: number; limit?: number }, thunkAPI) => {
  try {
    const res = await notificationApi.list(filters);
    return res.data;
  } catch (err: unknown) {
    const mess = 'Failed to fetch notifications'
    if (isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
    } else {
      return thunkAPI.rejectWithValue(mess);
    }
  }
}
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (_, thunkAPI) => {
    try {
      const res = await notificationApi.getUnreadCount();
      return res.data.count;
    } catch (err: unknown) {
      const mess = 'Failed to fetch unread count'
      if (isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
      } else {
        return thunkAPI.rejectWithValue(mess);
      }
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, thunkAPI) => {
    try {
      const res = await notificationApi.markAsRead(id);
      return res.data;
    } catch (err: unknown) {
      const mess = 'Failed to mark as read'
      if (isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
      } else {
        return thunkAPI.rejectWithValue(mess);
      }
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, thunkAPI) => {
    try {
      const res = await notificationApi.markAllAsRead();
      return res.data.count;
    } catch (err: unknown) {
      const mess = 'Failed to mark all as read'
      if (isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
      } else {
        return thunkAPI.rejectWithValue(mess);
      }
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: string, thunkAPI) => {
    try {
      await notificationApi.delete(id);
      return id;
    } catch (err: unknown) {
      const mess = 'Failed to delete notification'
      if (isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
      } else {
        return thunkAPI.rejectWithValue(mess);
      }
    }
  }
);

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasRead = state.notifications[index].read;
        state.notifications[index] = action.payload;
        if (!wasRead && action.payload.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (wasRead && !action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  },
  extraReducers: (builder) => {
    /* Fetch notifications */
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<{ notifications: Notification[]; total: number }>) => {
      state.loading = false;
      state.notifications = action.payload.notifications;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* Fetch unread count */
    builder.addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    });

    /* Mark as read */
    builder.addCase(markAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasRead = state.notifications[index].read;
        state.notifications[index] = action.payload;
        if (!wasRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    });

    /* Mark all as read */
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    });

    /* Delete */
    builder.addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    });
  }
});

export const { addNotification, updateNotification, removeNotification, incrementUnreadCount, decrementUnreadCount } = slice.actions;
export default slice.reducer;

/* Selectors */
export const selectAllNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;

