import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance' // Make sure this sets the JWT token!

// CREATE product
export const createProduct = createAsyncThunk(
  'product/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/product/', productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to create product' })
    }
  }
)

// LIST all products
export const listProducts = createAsyncThunk(
  'product/list',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/product/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch products' })
    }
  }
)

// GET single product
export const getProduct = createAsyncThunk(
  'product/get',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/product/${productId}/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch product' })
    }
  }
)

// LIST products by supplier
export const listProductsBySupplier = createAsyncThunk(
  'product/listBySupplier',
  async (supplierId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/product/supplier/${supplierId}/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch supplier products' })
    }
  }
)

const initialState = {
  products: [],
  supplierProducts: [],
  product: null,
  isLoading: false,
  error: null,
  success: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductState: (state) => {
      state.products = []
      state.supplierProducts = []
      state.product = null
      state.isLoading = false
      state.error = null
      state.success = null
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.product = action.payload
        state.success = 'Product created successfully'
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // LIST ALL
      .addCase(listProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // GET ONE
      .addCase(getProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.product = action.payload
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // LIST BY SUPPLIER
      .addCase(listProductsBySupplier.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(listProductsBySupplier.fulfilled, (state, action) => {
        state.isLoading = false
        state.supplierProducts = action.payload
      })
      .addCase(listProductsBySupplier.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearProductState } = productSlice.actions
export default productSlice.reducer