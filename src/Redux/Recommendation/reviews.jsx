    // import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
    // import axios from '../axiosInstance';

    // export const fetchAllAgronomistRecommendations = createAsyncThunk(
    // 'recommendation/fetchAll',
    // async (_, { rejectWithValue }) => {
    //     try {
    //     const res = await axios.get('/recommendations/agronomist-all/');
    //     return res.data;
    //     } catch (err) {
    //     return rejectWithValue(err.response?.data || "Failed to load recommendations");
    //     }
    // }
    // );

    // // ⬇️ Example thunks if still needed (optional):
    // // export { createFullRecommendation, submitRecommendation, reviewRecommendation, etc... }

    // const initialState = {
    // isLoading: false,
    // fullRecommendation: null,
    // cropOnlyRecommendation: null,
    // submittedRecommendation: null,
    // allRecommendations: [],  
    // selectedRecommendation: null,
    // fertilizerData: null,
    // error: null,
    // success: null,
    // };

    // const recommendationSlice = createSlice({
    // name: 'recommend',
    // initialState,
    // reducers: {
    //     clearRecommendationState: (state) => {
    //     state.isLoading = false;
    //     state.fullRecommendation = null;
    //     state.cropOnlyRecommendation = null;
    //     state.submittedRecommendation = null;
    //     state.error = null;
    //     state.success = null;
    //     },
    // },
    // extraReducers: (builder) => {
    //     builder

    //     // 🔁 Fetch All Recommendations for Agronomist
    //     .addCase(fetchAllAgronomistRecommendations.pending, (state) => {
    //         state.isLoading = true;
    //         state.error = null;
    //     })
    //     .addCase(fetchAllAgronomistRecommendations.fulfilled, (state, action) => {
    //         state.isLoading = false;
    //         state.allRecommendations = action.payload;
    //     })
    //     .addCase(fetchAllAgronomistRecommendations.rejected, (state, action) => {
    //         state.isLoading = false;
    //         state.error = action.payload;
    //     })

        
    // },
    // });

    // export const { clearRecommendationState } = recommendationSlice.actions;
    // export default recommendationSlice.reducer;

    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axiosInstance';

// Agronomist: fetch all actionable recommendations
export const fetchAllAgronomistRecommendations = createAsyncThunk(
  'recommendation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/recommendations/agronomist-all/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to load recommendations');
    }
  }
);

// Fertilizer: get plan from JSON by crop name
export const fetchFertilizerPlan = createAsyncThunk(
  'fertilizer/plan',
  async (cropName, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/fertilizer/${encodeURIComponent(cropName)}/`);
      return { cropName, plan: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to fetch fertilizer plan' });
    }
  }
);

// Fertilizer: submit to agronomist (creates a CropRecommendation with fertilizer_plan)
export const submitFertilizerToAgronomist = createAsyncThunk(
  'fertilizer/submit',
  async (payload, { rejectWithValue }) => {
    try {
      // payload: { crop_name, farmer_inputs, use_ml?, ml_inputs? }
      const res = await axios.post('/fertilizer/submit/', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to submit fertilizer to agronomist' });
    }
  }
);

const initialState = {
  // Shared
  isLoading: false,
  error: null,
  success: null,

  // Recommendations (agronomist)
  allRecommendations: [],
  selectedRecommendation: null,

  // Fertilizer-specific
  isFertilizerLoading: false,
  isSubmittingFertilizer: false,
  fertilizerPlan: null,           // plan from JSON
  fertilizerPlanCrop: null,       // which crop the plan belongs to
  fertilizerSubmitResult: null,   // created CropRecommendation after submit

  // Legacy fields kept if your UI references them
  fullRecommendation: null,
  cropOnlyRecommendation: null,
  submittedRecommendation: null,
};

const recommendationSlice = createSlice({
  name: 'recommend',
  initialState,
  reducers: {
    clearRecommendationState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = null;

      state.fullRecommendation = null;
      state.cropOnlyRecommendation = null;
      state.submittedRecommendation = null;
      state.selectedRecommendation = null;

      state.isFertilizerLoading = false;
      state.isSubmittingFertilizer = false;
      state.fertilizerPlan = null;
      state.fertilizerPlanCrop = null;
      state.fertilizerSubmitResult = null;
    },
    clearFertilizerPlan: (state) => {
      state.fertilizerPlan = null;
      state.fertilizerPlanCrop = null;
    },
    clearFertilizerSubmitResult: (state) => {
      state.fertilizerSubmitResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Agronomist: fetch all
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

      // Fertilizer plan (GET /fertilizer/:crop/)
      .addCase(fetchFertilizerPlan.pending, (state) => {
        state.isFertilizerLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchFertilizerPlan.fulfilled, (state, action) => {
        state.isFertilizerLoading = false;
        state.fertilizerPlan = action.payload.plan;
        state.fertilizerPlanCrop = action.payload.cropName;
      })
      .addCase(fetchFertilizerPlan.rejected, (state, action) => {
        state.isFertilizerLoading = false;
        state.error = action.payload;
      })

      // Fertilizer submit (POST /fertilizer/submit/)
      .addCase(submitFertilizerToAgronomist.pending, (state) => {
        state.isSubmittingFertilizer = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitFertilizerToAgronomist.fulfilled, (state, action) => {
        state.isSubmittingFertilizer = false;
        state.fertilizerSubmitResult = action.payload; // created CropRecommendation
        state.success = 'Fertilizer plan sent to agronomist';

        // Optional: optimistic add to list if you have it in view
        if (Array.isArray(state.allRecommendations)) {
          state.allRecommendations = [action.payload, ...state.allRecommendations];
        }
      })
      .addCase(submitFertilizerToAgronomist.rejected, (state, action) => {
        state.isSubmittingFertilizer = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearRecommendationState,
  clearFertilizerPlan,
  clearFertilizerSubmitResult,
} = recommendationSlice.actions;

export default recommendationSlice.reducer;