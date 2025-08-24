import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../axiosInstance"

// Helpers
const toParams = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  )

const normalizeError = (err) =>
  err?.response?.data || err?.message || "Request failed"

// Thunks

// Admin/Leader: list all feedback with optional filters: { status, role, q, page, page_size }
export const listFeedbacks = createAsyncThunk(
  "feedback/listAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get("/feedbacks/", { params: toParams(params) })
      return res.data // { results, meta }
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Current user: list my feedback with optional filters: { status, q, page, page_size }
export const listMyFeedbacks = createAsyncThunk(
  "feedback/listMine",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get("/feedbacks/me/", { params: toParams(params) })
      return res.data // { results, meta }
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Create feedback (farmer/supplier): { content }
export const createFeedback = createAsyncThunk(
  "feedback/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/feedbacks/create/", payload)
      return res.data // feedback
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Alternative create feedback endpoint
export const submitFeedback = createAsyncThunk(
  "feedback/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/feedbacks/submit/", payload)
      return res.data // feedback
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Get feedback by id
export const getFeedbackById = createAsyncThunk(
  "feedback/detail",
  async (feedbackId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/feedbacks/${feedbackId}/`)
      return res.data // feedback
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Update feedback (admin/leader): { feedbackId, data } where data = { status?, response? }
export const updateFeedback = createAsyncThunk(
  "feedback/update",
  async ({ feedbackId, data }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/feedbacks/${feedbackId}/update/`, data)
      return res.data // feedback
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Update my own feedback (content only, if status is 'new')
export const updateMyFeedback = createAsyncThunk(
  "feedback/updateMine",
  async ({ feedbackId, data }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/feedbacks/me/${feedbackId}/update/`, data)
      return res.data // feedback
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

// Delete feedback (admin/leader)
export const deleteFeedback = createAsyncThunk(
  "feedback/delete",
  async (feedbackId, { rejectWithValue }) => {
    try {
      await axios.delete(`/feedbacks/${feedbackId}/delete/`)
      return { id: feedbackId }
    } catch (err) {
      return rejectWithValue(normalizeError(err))
    }
  }
)

const initialState = {
  // Admin/leader list
  all: [],
  allMeta: null,
  isLoadingAll: false,

  // Current user's list
  mine: [],
  myMeta: null,
  isLoadingMine: false,

  // Detail
  byId: {},
  selected: null,
  isLoadingDetail: false,

  // Mutations
  isCreating: false,
  isSubmitting: false, // For submitFeedback
  isUpdating: false,
  isUpdatingMine: false, // For updateMyFeedback
  isDeleting: false,

  // Filters (optional)
  filtersAll: { status: "", role: "", q: "", page: 1, page_size: 20 },
  filtersMine: { status: "", q: "", page: 1, page_size: 20 },

  // Messages
  error: null,
  success: null,
}

const upsertById = (state, item) => {
  if (!item?.id) return
  state.byId[item.id] = item
}

const updateInArray = (arr, item) => {
  const idx = arr.findIndex((f) => String(f.id) === String(item.id))
  if (idx >= 0) arr[idx] = item
}

const removeFromArray = (arr, id) => {
  const idx = arr.findIndex((f) => String(f.id) === String(id))
  if (idx >= 0) arr.splice(idx, 1)
}

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackState: () => ({ ...initialState }),
    clearFeedbackError: (state) => {
      state.error = null
    },
    clearFeedbackSuccess: (state) => {
      state.success = null
    },
    setAllFilters: (state, action) => {
      state.filtersAll = { ...state.filtersAll, ...action.payload }
    },
    setMyFilters: (state, action) => {
      state.filtersMine = { ...state.filtersMine, ...action.payload }
    },
    selectFeedbackId: (state, action) => {
      const id = action.payload
      state.selected = state.byId[id] || null
    },
  },
  extraReducers: (builder) => {
    builder
      // List all
      .addCase(listFeedbacks.pending, (state) => {
        state.isLoadingAll = true
        state.error = null
      })
      .addCase(listFeedbacks.fulfilled, (state, action) => {
        state.isLoadingAll = false
        const { results = [], meta = null } = action.payload || {}
        state.all = results
        state.allMeta = meta
        results.forEach((it) => upsertById(state, it))
      })
      .addCase(listFeedbacks.rejected, (state, action) => {
        state.isLoadingAll = false
        state.error = action.payload || action.error
      })

      // List mine
      .addCase(listMyFeedbacks.pending, (state) => {
        state.isLoadingMine = true
        state.error = null
      })
      .addCase(listMyFeedbacks.fulfilled, (state, action) => {
        state.isLoadingMine = false
        const { results = [], meta = null } = action.payload || {}
        state.mine = results
        state.myMeta = meta
        results.forEach((it) => upsertById(state, it))
      })
      .addCase(listMyFeedbacks.rejected, (state, action) => {
        state.isLoadingMine = false
        state.error = action.payload || action.error
      })

      // Create
      .addCase(createFeedback.pending, (state) => {
        state.isCreating = true
        state.error = null
        state.success = null
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.isCreating = false
        const item = action.payload
        upsertById(state, item)
        // Prepend into "mine" list UX
        state.mine = [item, ...state.mine]
        state.success = "Feedback submitted"
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.payload || action.error
      })

      // Submit feedback (alternative endpoint)
      .addCase(submitFeedback.pending, (state) => {
        state.isSubmitting = true
        state.error = null
        state.success = null
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isSubmitting = false
        const item = action.payload
        upsertById(state, item)
        // Prepend into "mine" list UX
        state.mine = [item, ...state.mine]
        state.success = "Feedback submitted successfully"
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload || action.error
      })

      // Detail
      .addCase(getFeedbackById.pending, (state) => {
        state.isLoadingDetail = true
        state.error = null
      })
      .addCase(getFeedbackById.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        const item = action.payload
        upsertById(state, item)
        state.selected = item
      })
      .addCase(getFeedbackById.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.error = action.payload || action.error
      })

      // Update (admin/leader)
      .addCase(updateFeedback.pending, (state) => {
        state.isUpdating = true
        state.error = null
        state.success = null
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.isUpdating = false
        const item = action.payload
        upsertById(state, item)
        updateInArray(state.all, item)
        updateInArray(state.mine, item)
        if (state.selected?.id === item.id) state.selected = item
        state.success = "Feedback updated"
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload || action.error
      })

      // Update my feedback
      .addCase(updateMyFeedback.pending, (state) => {
        state.isUpdatingMine = true
        state.error = null
        state.success = null
      })
      .addCase(updateMyFeedback.fulfilled, (state, action) => {
        state.isUpdatingMine = false
        const item = action.payload
        upsertById(state, item)
        updateInArray(state.all, item)
        updateInArray(state.mine, item)
        if (state.selected?.id === item.id) state.selected = item
        state.success = "Your feedback updated"
      })
      .addCase(updateMyFeedback.rejected, (state, action) => {
        state.isUpdatingMine = false
        state.error = action.payload || action.error
      })

      // Delete
      .addCase(deleteFeedback.pending, (state) => {
        state.isDeleting = true
        state.error = null
        state.success = null
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.isDeleting = false
        const { id } = action.payload || {}
        if (id != null) {
          removeFromArray(state.all, id)
          removeFromArray(state.mine, id)
          if (state.selected?.id === id) state.selected = null
          delete state.byId[id]
        }
        state.success = "Feedback deleted"
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.isDeleting = false
        state.error = action.payload || action.error
      })
  },
})

export const {
  clearFeedbackState,
  clearFeedbackError,
  clearFeedbackSuccess,
  setAllFilters,
  setMyFilters,
  selectFeedbackId,
} = feedbackSlice.actions

export default feedbackSlice.reducer