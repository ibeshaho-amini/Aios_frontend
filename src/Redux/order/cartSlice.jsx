import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance'

// GET cart
export const getCart = createAsyncThunk('cart/get', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/orders/cart/')
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Failed to load cart' })
  }
})

// ADD item
export const addToCart = createAsyncThunk('cart/addItem', async ({ product, quantity }, { rejectWithValue }) => {
  try {
    const res = await axios.post('/orders/cart/items/', { product, quantity })
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Failed to add item' })
  }
})

// UPDATE item qty
export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/orders/cart/items/${itemId}/`, { quantity })
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Failed to update item' })
  }
})

// REMOVE item
export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`/orders/cart/items/${itemId}/remove/`)
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Failed to remove item' })
  }
})

// CHECKOUT
export const checkoutCart = createAsyncThunk('cart/checkout', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.post('/orders/cart/checkout/')
    return res.data // array of created orders
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Failed to checkout' })
  }
})

const initialState = {
  cart: null,          // { orderID, status='cart', items: [...] }
  isLoading: false,
  error: null,
  success: null,
  checkoutResult: null // array of created orders
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null
      state.isLoading = false
      state.error = null
      state.success = null
      state.checkoutResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(getCart.fulfilled, (state, action) => { state.isLoading = false; state.cart = action.payload })
      .addCase(getCart.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })

      .addCase(addToCart.pending, (state) => { state.isLoading = true; state.error = null; state.success = null })
      .addCase(addToCart.fulfilled, (state, action) => { state.isLoading = false; state.cart = action.payload; state.success = 'Item added' })
      .addCase(addToCart.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })

      .addCase(updateCartItem.pending, (state) => { state.isLoading = true; state.error = null; state.success = null })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.isLoading = false; state.cart = action.payload; state.success = 'Item updated' })
      .addCase(updateCartItem.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })

      .addCase(removeCartItem.pending, (state) => { state.isLoading = true; state.error = null; state.success = null })
      .addCase(removeCartItem.fulfilled, (state, action) => { state.isLoading = false; state.cart = action.payload; state.success = 'Item removed' })
      .addCase(removeCartItem.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })

      .addCase(checkoutCart.pending, (state) => { state.isLoading = true; state.error = null; state.success = null })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.checkoutResult = action.payload
        state.success = 'Order placed'
        // clear cart (backend emptied it)
        state.cart = { ...state.cart, items: [] }
      })
      .addCase(checkoutCart.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })
  },
})

export const { clearCartState } = cartSlice.actions
export default cartSlice.reducer