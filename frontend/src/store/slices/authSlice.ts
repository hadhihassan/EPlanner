import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, meAPI, refreshTokenAPI } from '../../api/auth.api';
import type { AuthState, User, LoginResponse, RegisterResponse } from '../../types/auth.types';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks (keep as is, they're correct)
export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await loginAPI(payload);
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }, thunkAPI) => {
    try {
      const res = await registerAPI(payload);
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const res = await meAPI();
    return res;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch user data'
    );
  }
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) throw new Error('No refresh token');
      
      const res = await refreshTokenAPI(refreshTokenValue);
      return res;
    } catch (error: any) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return thunkAPI.rejectWithValue('Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken; 
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken; 
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Fetch Me
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken; 
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;