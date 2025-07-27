import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axiosInstance';

export const createFullRecommendation = createAsyncThunk(
  'recommendation/full',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/prediction/', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to generate recommendation' });
    }
  }
);

export const createCropOnlyRecommendation = createAsyncThunk(
  'recommendation/cropOnly',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/crop-prediction/', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to generate crop-only recommendation' });
    }
  }
);

// Initial state
const initialState = {
  isLoading: false,
  fullRecommendation: null,
  cropOnlyRecommendation: null,
  error: null,
  success: null,
};

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    clearRecommendationState: (state) => {
      state.isLoading = false;
      state.fullRecommendation = null;
      state.cropOnlyRecommendation = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Full prediction
      .addCase(createFullRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createFullRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fullRecommendation = action.payload;
        state.success = 'Recommendation completed successfully';
      })
      .addCase(createFullRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Crop-only prediction
      .addCase(createCropOnlyRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCropOnlyRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cropOnlyRecommendation = action.payload;
        state.success = 'Crop-only recommendation completed successfully';
      })
      .addCase(createCropOnlyRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecommendationState } = recommendationSlice.actions;
export default recommendationSlice.reducer;