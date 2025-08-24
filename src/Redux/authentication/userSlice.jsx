import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

// Fetch all users (admin)
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'users/getById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user');
    }
  }
);

// Update user status (admin/leader)
// Pass either { userId, status: "active"|"inactive"|"suspended" }
// or { userId, is_active: true|false }
export const setUserStatus = createAsyncThunk(
  'users/setStatus',
  async ({ userId, status, is_active }, { rejectWithValue }) => {
    try {
      const payload = {};
      if (typeof status !== 'undefined') payload.status = status;
      if (typeof is_active !== 'undefined') payload.is_active = is_active;

      if (Object.keys(payload).length === 0) {
        return rejectWithValue('Provide "status" or "is_active" in payload');
      }

      const response = await axiosInstance.patch(`/users/${userId}/status/`, payload);
      return response.data; // Updated user object
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update user status');
    }
  }
);

const initialState = {
  users: [],
  user: null,
  isLoading: false,
  error: null,

  // status update specific
  isUpdatingStatus: false,
  statusError: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.users = [];
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.isUpdatingStatus = false;
      state.statusError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload || null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Set user status
      .addCase(setUserStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.statusError = null;
      })
      .addCase(setUserStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        const updated = action.payload;
        if (!updated || !updated.id) return;

        // Update user in list
        const idx = state.users.findIndex((u) => String(u.id) === String(updated.id));
        if (idx !== -1) {
          state.users[idx] = { ...state.users[idx], ...updated };
        }

        // Update currently loaded user if it matches
        if (state.user && String(state.user.id) === String(updated.id)) {
          state.user = { ...state.user, ...updated };
        }
      })
      .addCase(setUserStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.statusError = action.payload;
      });
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;