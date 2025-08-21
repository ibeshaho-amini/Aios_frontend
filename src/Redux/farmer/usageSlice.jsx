// Redux/usage/usageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance'

// Endpoints used:
// - GET    /usages/                       -> list_my_usages
// - POST   /usages/create/                -> create_usage
// - GET    /usages/:id/                   -> get_usage
// - PATCH  /usages/:id/update/            -> update_usage
// - DELETE /usages/:id/delete/            -> delete_usage
// - GET    /usages/summary/               -> usage_summary
// - GET    /admin/usages/                 -> list_all_usages

const buildQuery = (params = {}) => {
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') qp.append(k, v)
  })
  const s = qp.toString()
  return s ? `?${s}` : ''
}

// Self-service (farmer) — My usages
export const fetchMyUsages = createAsyncThunk(
  'usage/my/list',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/usages/${buildQuery(params)}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load usages' })
    }
  }
)

export const createUsage = createAsyncThunk(
  'usage/create',
  async (payload, { rejectWithValue }) => {
    try {
      // Backend binds farmer to current user
      const res = await axios.post('/usages/create/', payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to create usage' })
    }
  }
)

export const fetchUsageDetail = createAsyncThunk(
  'usage/detail',
  async (usageId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/usages/${usageId}/`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load usage' })
    }
  }
)

export const updateUsage = createAsyncThunk(
  'usage/update',
  async ({ usageId, data }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/usages/${usageId}/update/`, data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to update usage' })
    }
  }
)

export const deleteUsage = createAsyncThunk(
  'usage/delete',
  async (usageId, { rejectWithValue }) => {
    try {
      await axios.delete(`/usages/${usageId}/delete/`)
      return { id: usageId }
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to delete usage' })
    }
  }
)

// Summary + Admin list
export const fetchUsageSummary = createAsyncThunk(
  'usage/summary',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/usages/summary/${buildQuery(params)}`)
      return res.data // { group_by: [...], results: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load summary' })
    }
  }
)

export const fetchAllUsages = createAsyncThunk(
  'usage/admin/list',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/admin/usages/${buildQuery(params)}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to load all usages' })
    }
  }
)

const initialState = {
  // My usages
  myUsages: [],
  isLoadingMy: false,

  // Admin/Agronomist
  allUsages: [],
  isLoadingAll: false,

  // Detail
  usageDetail: null,
  isLoadingDetail: false,

  // Summary
  summary: null,
  isLoadingSummary: false,

  // Mutations
  isSaving: false,
  isDeleting: false,

  // Common
  error: null,
  success: null,
}

const usageSlice = createSlice({
  name: 'usage',
  initialState,
  reducers: {
    clearUsageState: (state) => {
      state.isLoadingMy = false
      state.isLoadingAll = false
      state.isLoadingDetail = false
      state.isLoadingSummary = false
      state.isSaving = false
      state.isDeleting = false
      state.error = null
      state.success = null
      // Keep cached data unless you want to reset:
      // state.myUsages = []
      // state.allUsages = []
      // state.usageDetail = null
      // state.summary = null
    },
    clearUsageError: (state) => {
      state.error = null
    },
    clearUsageSuccess: (state) => {
      state.success = null
    },
  },
  extraReducers: (builder) => {
    builder
      // My list
      .addCase(fetchMyUsages.pending, (state) => {
        state.isLoadingMy = true
        state.error = null
      })
      .addCase(fetchMyUsages.fulfilled, (state, action) => {
        state.isLoadingMy = false
        state.myUsages = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchMyUsages.rejected, (state, action) => {
        state.isLoadingMy = false
        state.error = action.payload
      })

      // Admin list
      .addCase(fetchAllUsages.pending, (state) => {
        state.isLoadingAll = true
        state.error = null
      })
      .addCase(fetchAllUsages.fulfilled, (state, action) => {
        state.isLoadingAll = false
        state.allUsages = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchAllUsages.rejected, (state, action) => {
        state.isLoadingAll = false
        state.error = action.payload
      })

      // Detail
      .addCase(fetchUsageDetail.pending, (state) => {
        state.isLoadingDetail = true
        state.error = null
      })
      .addCase(fetchUsageDetail.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        state.usageDetail = action.payload
        // keep lists in sync
        const up = action.payload
        if (up?.id) {
          const id = String(up.id)
          const replace = (arr) => {
            const i = arr.findIndex((x) => String(x.id) === id)
            if (i >= 0) arr[i] = up
          }
          replace(state.myUsages)
          replace(state.allUsages)
        }
      })
      .addCase(fetchUsageDetail.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.error = action.payload
      })

      // Create
      .addCase(createUsage.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.success = null
      })
      .addCase(createUsage.fulfilled, (state, action) => {
        state.isSaving = false
        const item = action.payload
        if (item) {
          state.myUsages = [item, ...state.myUsages]
          state.allUsages = [item, ...state.allUsages]
          state.usageDetail = item
        }
        state.success = 'Usage created'
      })
      .addCase(createUsage.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })

      // Update
      .addCase(updateUsage.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.success = null
      })
      .addCase(updateUsage.fulfilled, (state, action) => {
        state.isSaving = false
        const up = action.payload
        if (up?.id) {
          const id = String(up.id)
          const replace = (arr) => {
            const i = arr.findIndex((x) => String(x.id) === id)
            if (i >= 0) arr[i] = up
          }
          replace(state.myUsages)
          replace(state.allUsages)
          state.usageDetail = up
        }
        state.success = 'Usage updated'
      })
      .addCase(updateUsage.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })

      // Delete
      .addCase(deleteUsage.pending, (state) => {
        state.isDeleting = true
        state.error = null
        state.success = null
      })
      .addCase(deleteUsage.fulfilled, (state, action) => {
        state.isDeleting = false
        const id = action.payload?.id
        if (id !== undefined && id !== null) {
          state.myUsages = state.myUsages.filter((x) => String(x.id) !== String(id))
          state.allUsages = state.allUsages.filter((x) => String(x.id) !== String(id))
          if (state.usageDetail && String(state.usageDetail.id) === String(id)) {
            state.usageDetail = null
          }
        }
        state.success = 'Usage deleted'
      })
      .addCase(deleteUsage.rejected, (state, action) => {
        state.isDeleting = false
        state.error = action.payload
      })

      // Summary
      .addCase(fetchUsageSummary.pending, (state) => {
        state.isLoadingSummary = true
        state.error = null
      })
      .addCase(fetchUsageSummary.fulfilled, (state, action) => {
        state.isLoadingSummary = false
        state.summary = action.payload
      })
      .addCase(fetchUsageSummary.rejected, (state, action) => {
        state.isLoadingSummary = false
        state.error = action.payload
      })
  },
})

export const { clearUsageState, clearUsageError, clearUsageSuccess } = usageSlice.actions
export default usageSlice.reducer