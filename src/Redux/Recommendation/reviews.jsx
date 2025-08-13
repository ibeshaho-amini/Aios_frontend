import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axiosInstance';

export const fetchAllAgronomistRecommendations = createAsyncThunk(
  'recommendation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/recommendations/agronomist-all/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load recommendations");
    }
  }
);

// ⬇️ Example thunks if still needed (optional):
// export { createFullRecommendation, submitRecommendation, reviewRecommendation, etc... }

const initialState = {
  isLoading: false,
  fullRecommendation: null,
  cropOnlyRecommendation: null,
  submittedRecommendation: null,
  allRecommendations: [],  
  selectedRecommendation: null,
  fertilizerData: null,
  error: null,
  success: null,
};

const recommendationSlice = createSlice({
  name: 'recommend',
  initialState,
  reducers: {
    clearRecommendationState: (state) => {
      state.isLoading = false;
      state.fullRecommendation = null;
      state.cropOnlyRecommendation = null;
      state.submittedRecommendation = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔁 Fetch All Recommendations for Agronomist
      .addCase(fetchAllAgronomistRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAgronomistRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRecommendations = action.payload;
      })
      .addCase(fetchAllAgronomistRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Add your other .addCase(createFullRecommendation...) here as needed
  },
});

export const { clearRecommendationState } = recommendationSlice.actions;
export default recommendationSlice.reducer;