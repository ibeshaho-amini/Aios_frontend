import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance'

// Create order
// payload example:
// {
//   user: 5,                // buyer user id
//   supplier: 3,            // Supplier table id (NOT user id)
//   items: [
//     { product: 42, quantity: 2, price_at_order: 1500.00 },
//     { product: 13, quantity: 1 }
//   ]
// }
export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/orders/create/', orderData)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to create order' })
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
      return rejectWithValue(err.response?.data || { detail: 'Failed to fetch orders' })
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
      return rejectWithValue(err.response?.data || { detail: 'Failed to fetch order' })
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
        // Push into list for immediate UI reflection
        if (state.orders && Array.isArray(state.orders)) {
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
  },
})

export const { clearOrderState } = orderSlice.actions
export default orderSlice.reducer