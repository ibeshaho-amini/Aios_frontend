// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../axiosInstance';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

//
// ========== ASYNC ACTIONS ==========
//

// ✅ Login Thunk
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login/`, { email, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('user_id', user.id);

      // Set default header for Axios instance
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return { access, refresh, user };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { detail: 'Login failed' });
    }
  }
);

// ✅ Signup Thunk
export const signupUser = createAsyncThunk(
  'user/signupUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register/`, userData);
    //   dispatch(sendOtp({ email: userData.email }));
      return { ...response.data, email: userData.email };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { detail: 'Registration failed' });
    }
  }
);

// ✅ Fetch All Users (admin)
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

// ✅ Get User by ID
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user');
    }
  }
);



// ✅ Logout
export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user_id');
    delete axios.defaults.headers.common['Authorization'];
    return true;
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

//
// ========== INITIAL STATE ==========
//

const userInStorage = localStorage.getItem('userInfo');

const initialState = {
  isLoading: false,
  isRegistered: false,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  error: null,
  otpSent: false,
  successMessage: '',
  isVerified: false,

  email: null,
  userInfo: userInStorage ? JSON.parse(userInStorage) : null,
  role: userInStorage ? JSON.parse(userInStorage)?.role : null,
  user: null,
  userId: localStorage.getItem('user_id') || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,

  allUsers: [],
  allUsersLoading: false,
  allUsersError: null,
};

//
// ========== SLICE ==========
//

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = '';
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.email = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.userId = null;
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
    },
  },
  extraReducers: (builder) => {
    builder
      // === Signup ===
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRegistered = true;
        state.email = action.payload.email;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

     
      

      // === Login ===
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.userInfo = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.role = null;
        state.userId = null;
        localStorage.removeItem('userInfo');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_id');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.role = action.payload.user.role;
        state.userId = action.payload.user.id;

        // Save to localStorage again (just in case)
        localStorage.setItem('userInfo', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
        localStorage.setItem('user_id', action.payload.user.id);
        
        console.log("Redux login.fulfilled: role =", action.payload.user.role, "user =", action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.userInfo = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.role = null;
        state.userId = null;
        localStorage.removeItem('userInfo');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_id');
        state.error = action.payload;
      })

      // === Get Current User Info ===
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // === Fetch All Users (Admin) ===
      .addCase(fetchAllUsers.pending, (state) => {
        state.allUsersLoading = true;
        state.allUsersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsersLoading = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.allUsersLoading = false;
        state.allUsersError = action.payload;
      })

      // === Logout Final Reducer State ===
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.role = null;
        state.userId = null;
      });
  },
});

//
// ========== EXPORTS ==========
//

export const { clearSuccessMessage, logout } = authSlice.actions;
export default authSlice.reducer;