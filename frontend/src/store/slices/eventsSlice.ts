/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { listEventsAPI, createEventAPI, getEventAPI, updateEventAPI, deleteEventAPI } from '../../api/events.api';
import type { RootState } from '../index';
import type { Attachment } from '../../components/events/EditEventModal';
import type { EventState } from '../../types/event.types';
import type { User } from '../../types/auth.types';
import { isAxiosError } from 'axios';
export interface Event {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  category?: string;
  location?: string;
  participants?: string[];
  status?: string;
  attachments?: Attachment[]
  organizer?: string | User
}

// Define the API response type
interface EventsResponse {
  events: Event[];
  total: number;
  page: string | number;
  totalPages: number;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 9, // Default to 9 for 3x3 grid
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  }
};

export const fetchEvents = createAsyncThunk('events/list', async (payload: {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}, thunkAPI) => {
  try {
    const res = await listEventsAPI(payload.q, payload.status, payload?.page, payload?.limit);
    return res;
  } catch (err: unknown) {
    const mess = 'Failed to fetch events'
    if (isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
    } else {
      return thunkAPI.rejectWithValue(mess);
    }
  }
});

export const createEvent = createAsyncThunk('events/create', async (payload: FormData, thunkAPI) => {
  try {
    const res = await createEventAPI(payload);
    return res;
  } catch (err: unknown) {
    const mess = 'Failed to create event'
    if (isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
    } else {
      return thunkAPI.rejectWithValue(mess);
    }
  }
});

export const getEvent = createAsyncThunk('events/get', async (id: string, thunkAPI) => {
  try {
    const res = await getEventAPI(id);
    return res;
  } catch (err: unknown) {
    const mess = 'Failed to get event'
    if (isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
    } else {
      return thunkAPI.rejectWithValue(mess);
    }
  }
});

export const updateEvent = createAsyncThunk('events/update', async ({ id, payload }: { id: string; payload: FormData }, thunkAPI) => {
  try {
    const res = await updateEventAPI(id, payload);
    return res;
  } catch (err: unknown) {
    const mess = 'Failed to update event'
    if (isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
    } else {
      return thunkAPI.rejectWithValue(mess);
    }
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (id: string, thunkAPI) => {
  try {
    await deleteEventAPI(id);
    return id;
  } catch (err: unknown) {
    const mess = 'Failed to delete events'
    if (isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || mess);
    } else {
      return thunkAPI.rejectWithValue(mess);
    }

  }
});

const slice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelected: (state) => { state.selectedEvent = null; },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEvents.pending, (state: EventState) => { state.loading = true; });
    builder.addCase(fetchEvents.fulfilled, (state: EventState, action: PayloadAction<EventsResponse>) => {
      state.loading = false;

      // Handle the response object correctly
      const response = action.payload;
      state.events = response.events.map(ev => ({
        ...ev,
        id: ev.id || ev._id,
        _id: ev._id || ev.id
      }));

      // Update pagination state
      state.pagination = {
        ...state.pagination,
        page: typeof response.page === 'string' ? parseInt(response.page) : response.page,
        total: response.total,
        totalPages: response.totalPages,
        hasNext: (typeof response.page === 'string' ? parseInt(response.page) : response.page) < response.totalPages,
        hasPrev: (typeof response.page === 'string' ? parseInt(response.page) : response.page) > 1
      };
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* Create */
    builder.addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      const newEvent = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
        _id: action.payload._id || action.payload.id
      };
      state.events.unshift(newEvent);
    });

    /* Get single */
    builder.addCase(getEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      const event = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
        _id: action.payload._id || action.payload.id
      };
      state.selectedEvent = event;
    });

    /* Update */
    builder.addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      const updatedEvent = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
        _id: action.payload._id || action.payload.id
      };
      state.events = state.events.map(ev => {
        const evId = ev.id || ev._id;
        const payloadId = updatedEvent.id || updatedEvent._id;
        return evId === payloadId ? updatedEvent : ev;
      });
      if (state.selectedEvent) {
        const selectedId = state.selectedEvent.id || state.selectedEvent?._id;
        const payloadId = updatedEvent.id || updatedEvent._id;
        if (selectedId === payloadId) {
          state.selectedEvent = updatedEvent;
        }
      }
    });

    /* Delete */
    builder.addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(ev => {
        const evId = ev.id || ev._id;
        return evId !== action.payload;
      });
      if (state.selectedEvent) {
        const selectedId = state.selectedEvent.id || state.selectedEvent?._id;
        if (selectedId === action.payload) {
          state.selectedEvent = null;
        }
      }
    });
  }
});

export const { clearSelected, setPage } = slice.actions;
export default slice.reducer;

export const selectAllEvents = (state: RootState) => state.events.events;
export const selectEvent = (state: RootState) => state.events.selectedEvent;
export const selectEventsLoading = (state: RootState) => state.events.loading;
export const selectEventsPagination = (state: RootState) => state.events.pagination;