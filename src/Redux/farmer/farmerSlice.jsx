import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance'

// Self-service (farmer)
export const fetchMyFarmerProfile = createAsyncThunk(
  'farmer/me/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/farmers/me/')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load profile' })
    }
  }
)

export const createMyFarmerProfile = createAsyncThunk(
  'farmer/me/create',
  async (payload, { rejectWithValue }) => {
    try {
      // payload: { phone?, address?, farm_size_ha?, preferred_language?, extra? }
      const res = await axios.post('/farmers/me/create/', payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to create profile' })
    }
  }
)

export const updateMyFarmerProfile = createAsyncThunk(
  'farmer/me/update',
  async (payload, { rejectWithValue }) => {
    try {
      // payload: partial fields to update
      const res = await axios.patch('/farmers/me/update/', payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to update profile' })
    }
  }
)

// Admin/Agronomist
export const listFarmers = createAsyncThunk(
  'farmer/list',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/farmers/')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load farmers' })
    }
  }
)

export const getFarmerById = createAsyncThunk(
  'farmer/detail',
  async (farmerId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/farmers/${farmerId}/`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load farmer' })
    }
  }
)

const initialState = {
  // My profile
  myProfile: null,
  isLoadingProfile: false,
  isSavingProfile: false,

  // List + detail (admin/agronomist)
  farmers: [],
  selectedFarmer: null,
  isLoadingList: false,
  isLoadingDetail: false,

  // Common
  error: null,
  success: null,
}

const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    clearFarmerState: (state) => {
      state.isLoadingProfile = false
      state.isSavingProfile = false
      state.isLoadingList = false
      state.isLoadingDetail = false
      state.error = null
      state.success = null
      // Keep cached data unless you also want to reset:
      // state.myProfile = null
      // state.farmers = []
      // state.selectedFarmer = null
    },
    clearFarmerError: (state) => {
      state.error = null
    },
    clearFarmerSuccess: (state) => {
      state.success = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my profile
      .addCase(fetchMyFarmerProfile.pending, (state) => {
        state.isLoadingProfile = true
        state.error = null
      })
      .addCase(fetchMyFarmerProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false
        state.myProfile = action.payload
      })
      .addCase(fetchMyFarmerProfile.rejected, (state, action) => {
        state.isLoadingProfile = false
        state.error = action.payload
      })

      // Create my profile
      .addCase(createMyFarmerProfile.pending, (state) => {
        state.isSavingProfile = true
        state.error = null
        state.success = null
      })
      .addCase(createMyFarmerProfile.fulfilled, (state, action) => {
        state.isSavingProfile = false
        state.myProfile = action.payload
        state.success = 'Farmer profile created'
      })
      .addCase(createMyFarmerProfile.rejected, (state, action) => {
        state.isSavingProfile = false
        state.error = action.payload
      })

      // Update my profile
      .addCase(updateMyFarmerProfile.pending, (state) => {
        state.isSavingProfile = true
        state.error = null
        state.success = null
      })
      .addCase(updateMyFarmerProfile.fulfilled, (state, action) => {
        state.isSavingProfile = false
        state.myProfile = action.payload
        state.success = 'Farmer profile updated'
      })
      .addCase(updateMyFarmerProfile.rejected, (state, action) => {
        state.isSavingProfile = false
        state.error = action.payload
      })

      // List farmers (admin/agronomist)
      .addCase(listFarmers.pending, (state) => {
        state.isLoadingList = true
        state.error = null
      })
      .addCase(listFarmers.fulfilled, (state, action) => {
        state.isLoadingList = false
        state.farmers = action.payload
      })
      .addCase(listFarmers.rejected, (state, action) => {
        state.isLoadingList = false
        state.error = action.payload
      })

      // Get farmer by id
      .addCase(getFarmerById.pending, (state) => {
        state.isLoadingDetail = true
        state.error = null
      })
      .addCase(getFarmerById.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        state.selectedFarmer = action.payload
      })
      .addCase(getFarmerById.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.error = action.payload
      })
  },
})

export const { clearFarmerState, clearFarmerError, clearFarmerSuccess } = farmerSlice.actions
export default farmerSlice.reducer