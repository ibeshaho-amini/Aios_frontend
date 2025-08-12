import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance'

// Create order
export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/orders/create/', orderData)
      return res.data
    } catch (err) {
      const data = err.response?.data
      const message =
        typeof data === 'string' ? data :
        data?.detail || data?.error || 'Failed to create order'
      return rejectWithValue({ detail: message, raw: data })
    }
  }
)

// List all orders
export const listOrders = createAsyncThunk(
  'order/list',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/orders/')
      return res.data
    } catch (err) {
      const data = err.response?.data
      const message =
        typeof data === 'string' ? data :
        data?.detail || data?.error || 'Failed to fetch orders'
      return rejectWithValue({ detail: message, raw: data })
    }
  }
)

// Get single order by orderID (primary key)
export const getOrder = createAsyncThunk(
  'order/get',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/orders/${orderId}/`)
      return res.data
    } catch (err) {
      const data = err.response?.data
      const message =
        typeof data === 'string' ? data :
        data?.detail || data?.error || 'Failed to fetch order'
      return rejectWithValue({ detail: message, raw: data })
    }
  }
)

// NEW: Supplier updates order status (PATCH /orders/:orderID/status/)
export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ orderID, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/orders/${orderID}/status/`, { status })
      return res.data
    } catch (err) {
      const data = err.response?.data
      const message =
        typeof data === 'string' ? data :
        data?.detail || data?.error || 'Failed to update order status'
      return rejectWithValue({ detail: message, raw: data })
    }
  }
)

const initialState = {
  orders: [],
  order: null,       // current order (e.g., detail view)
  isLoading: false,
  error: null,
  success: null,
}

function replaceByOrderID(orders, updated) {
  const idx = orders.findIndex(o => o.orderID === updated.orderID)
  if (idx !== -1) orders[idx] = updated
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.orders = []
      state.order = null
      state.isLoading = false
      state.error = null
      state.success = null
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.order = action.payload
        state.success = 'Order created successfully'
        if (Array.isArray(state.orders)) {
          state.orders.unshift(action.payload)
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // LIST
      .addCase(listOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // GET
      .addCase(getOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.order = action.payload
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // UPDATE STATUS (supplier action)
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = 'Order status updated'
        const updated = action.payload
        if (updated) {
          replaceByOrderID(state.orders, updated)
          if (state.order?.orderID === updated.orderID) {
            state.order = updated
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearOrderState } = orderSlice.actions
export default orderSlice.reducer