import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { listEventsAPI, createEventAPI, getEventAPI,  updateEventAPI, deleteEventAPI } from '../../api/events.api';
import type { RootState } from '../index';

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
}

interface EventState {
  events: Event[];
  selectedEvent?: Event | null;
  loading: boolean;
  error?: string | null;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null
};

export const fetchEvents = createAsyncThunk('events/list', async (_, thunkAPI) => {
  try {
    const res = await listEventsAPI();
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Failed to fetch events');
  }
});

export const createEvent = createAsyncThunk('events/create', async (payload: Partial<Event>, thunkAPI) => {
  try {
    const res = await createEventAPI(payload);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Failed to create event');
  }
});

export const getEvent = createAsyncThunk('events/get', async (id: string, thunkAPI) => {
  try {
    const res = await getEventAPI(id);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Failed to get event');
  }
});

export const updateEvent = createAsyncThunk('events/update', async ({ id, payload }: { id: string; payload: Partial<Event> }, thunkAPI) => {
  try {
    const res = await updateEventAPI(id, payload);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Failed to update event');
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (id: string, thunkAPI) => {
  try {
    await deleteEventAPI(id);
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Failed to delete event');
  }
});

/* ───────────────────────────────
 *  Slice
 * ─────────────────────────────── */

const slice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelected: (state) => { state.selectedEvent = null; }
  },
  extraReducers: (builder) => {
    /* Fetch all */
    builder.addCase(fetchEvents.pending, (state) => { state.loading = true; });
    builder.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
      state.loading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* Create */
    builder.addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload);
    });

    /* Get single */
    builder.addCase(getEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      state.selectedEvent = action.payload;
    });

    /* Update */
    builder.addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      state.events = state.events.map(ev => (ev._id === action.payload._id ? action.payload : ev));
      if (state.selectedEvent && state.selectedEvent._id === action.payload._id)
        state.selectedEvent = action.payload;
    });

    /* Delete */
    builder.addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(ev => ev._id !== action.payload);
    });
  }
});

export const { clearSelected } = slice.actions;
export default slice.reducer;

/* ───────────────────────────────
 *  Selectors
 * ─────────────────────────────── */
export const selectAllEvents = (state: RootState) => state.events.events;
export const selectEvent = (state: RootState) => state.events.selectedEvent;
export const selectEventsLoading = (state: RootState) => state.events.loading;
