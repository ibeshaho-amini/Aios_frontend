// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../axiosInstance';

// export const createFullRecommendation = createAsyncThunk(
//   'recommendation/full',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/prediction/', formData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to generate recommendation' });
//     }
//   }
// );

// export const createCropOnlyRecommendation = createAsyncThunk(
//   'recommendation/cropOnly',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/crop-prediction/', formData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to generate crop-only recommendation' });
//     }
//   }
// );

// export const fetchFertilizerByCrop = createAsyncThunk(
//     "fertilizer/fetchByCrop",
//     async (cropName, { rejectWithValue }) => {
//       try {
//         const response = await axios.get(`/fertilizer/${cropName}/`);
//         return response.data;
//       } catch (error) {
//         return rejectWithValue(error.response?.data || { detail: "Failed to load data" });
//       }
//     }
//   );
// // Initial state
// const initialState = {
//   isLoading: false,
//   fullRecommendation: null,
//   cropOnlyRecommendation: null,
//   fertilizerData: null,
//   error: null,
//   success: null,
// };

// const recommendationSlice = createSlice({
//   name: 'recommendation',
//   initialState,
//   reducers: {
//     clearRecommendationState: (state) => {
//       state.isLoading = false;
//       state.fullRecommendation = null;
//       state.cropOnlyRecommendation = null;
//       state.error = null;
//       state.success = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Full prediction
//       .addCase(createFullRecommendation.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//         state.success = null;
//       })
//       .addCase(createFullRecommendation.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.fullRecommendation = action.payload;
//         state.success = 'Recommendation completed successfully';
//       })
//       .addCase(createFullRecommendation.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       // Crop-only prediction
//       .addCase(createCropOnlyRecommendation.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//         state.success = null;
//       })
//       .addCase(createCropOnlyRecommendation.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cropOnlyRecommendation = action.payload;
//         state.success = 'Crop-only recommendation completed successfully';
//       })
//       .addCase(createCropOnlyRecommendation.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

    
//           .addCase(fetchFertilizerByCrop.pending, (state) => {
//             state.isLoading = true;
//             state.error = null;
//           })
//           .addCase(fetchFertilizerByCrop.fulfilled, (state, action) => {
//             state.isLoading = false;
//             state.fertilizerData = action.payload; 
//           })
//           .addCase(fetchFertilizerByCrop.rejected, (state, action) => {
//             state.isLoading = false;
//             state.error = action.payload.detail || "Could not fetch fertilizer data";
//           });
//   },
// });

// export const { clearRecommendationState } = recommendationSlice.actions;
// export default recommendationSlice.reducer;


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

// Farmer manually submits a recommendation
export const submitRecommendation = createAsyncThunk(
  'recommendation/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/recommendations/submit/', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Submission failed' });
    }
  }
);

// Farmer fetches their recommendations
export const fetchMyRecommendations = createAsyncThunk(
  'recommendation/my',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/recommendations/my/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch recommendations' });
    }
  }
);

// Agronomist's inbox
export const fetchInbox = createAsyncThunk(
  'recommendation/inbox',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/recommendations/inbox/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch inbox' });
    }
  }
);

// Agronomist takes ownership
export const claimRecommendation = createAsyncThunk(
  'recommendation/claim',
  async (recId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/recommendations/${recId}/claim/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to claim recommendation' });
    }
  }
);

// Agronomist reviews/updates recommendation
export const reviewRecommendation = createAsyncThunk(
  'recommendation/review',
  async ({ recId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/recommendations/${recId}/review/`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to review recommendation' });
    }
  }
);

// Optional: Get specific recommendation details
export const getRecommendationDetails = createAsyncThunk(
  'recommendation/details',
  async (recId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/recommendations/${recId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to load' });
    }
  }
);

// Optional: Fetch fertilizer based on result (if separate model)
export const fetchFertilizerByCrop = createAsyncThunk(
  'fertilizer/fetchByCrop',
  async (cropName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/fertilizer/${cropName}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to load data' });
    }
  }
);

export const getMyReviews = createAsyncThunk(
  "recommendation/myReviews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/my-reviews/")
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch")
    }
  }
)
// Initial state
const initialState = {
  isLoading: false,
  fullRecommendation: null,
  cropOnlyRecommendation: null,
  submittedRecommendation: null,
  inbox: [],
  myReviewed: [],
  myRecommendations: [],
  selectedRecommendation: null,
  fertilizerData: null,
  error: null,
  success: null,
};

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    clearRecommendationState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = null;
      state.fullRecommendation = null;
      state.cropOnlyRecommendation = null;
      state.submittedRecommendation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Full Recommendation
      .addCase(createFullRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFullRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fullRecommendation = action.payload;
        state.success = 'Full recommendation created successfully';
      })
      .addCase(createFullRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Crop Only Recommendation
      .addCase(createCropOnlyRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCropOnlyRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cropOnlyRecommendation = action.payload;
        state.success = 'Crop-only recommendation created successfully';
      })
      .addCase(createCropOnlyRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Submit Recommendation
      .addCase(submitRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submittedRecommendation = action.payload;
        state.success = 'Recommendation submitted to agronomist';
      })
      .addCase(submitRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch My Recommendations
      .addCase(fetchMyRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRecommendations = action.payload;
      })
      .addCase(fetchMyRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Inbox
      .addCase(fetchInbox.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInbox.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inbox = action.payload;
      })
      .addCase(fetchInbox.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      //reviews
      .addCase(getMyReviews.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getMyReviews.fulfilled, (state, action) => {
      state.isLoading = false
      state.myReviewed = action.payload
    })
    .addCase(getMyReviews.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })
      // Claim
      .addCase(claimRecommendation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(claimRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Recommendation claimed successfully';
      })
      .addCase(claimRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Review
      .addCase(reviewRecommendation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reviewRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Recommendation updated successfully';
      })
      .addCase(reviewRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Recommendation Details
      .addCase(getRecommendationDetails.fulfilled, (state, action) => {
        state.selectedRecommendation = action.payload;
      })

      // Fertilizer
      .addCase(fetchFertilizerByCrop.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFertilizerByCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fertilizerData = action.payload;
      })
      .addCase(fetchFertilizerByCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecommendationState } = recommendationSlice.actions;
export default recommendationSlice.reducer;