
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import axios from '../axiosInstance'

// // CREATE product (unchanged)
// export const createProduct = createAsyncThunk(
//   'product/create',
//   async (productData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/products/create/', productData)
//       return response.data
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to create product' })
//     }
//   }
// )

// // LIST all products (unchanged)
// export const listProducts = createAsyncThunk(
//   'product/list',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get('/products/')
//       return response.data
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to fetch products' })
//     }
//   }
// )

// // GET single product (unchanged)
// export const getProduct = createAsyncThunk(
//   'product/get',
//   async (productId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`/products/${productId}/`)
//       return response.data
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to fetch product' })
//     }
//   }
// )

// // LIST products by supplier USER id
// export const listProductsBySupplier = createAsyncThunk(
//   'product/listBySupplier',
//   async (supplierUserId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`/products/supplier/${supplierUserId}/`)
//       return { supplierUserId, products: response.data }
//     } catch (error) {
//       return rejectWithValue({
//         supplierUserId,
//         error: error.response?.data || { detail: 'Failed to fetch supplier products' },
//       })
//     }
//   }
// )

// const initialState = {
//   products: [],
//   product: null,
//   isLoading: false,
//   error: null,
//   success: null,

//   // keyed by supplierUserId
//   productsBySupplierUserId: {},   // { [supplierUserId]: Product[] }
//   loadingBySupplierUserId: {},    // { [supplierUserId]: boolean }
//   errorBySupplierUserId: {},      // { [supplierUserId]: any }
// }

// const productSlice = createSlice({
//   name: 'product',
//   initialState,
//   reducers: {
//     clearProductState: (state) => {
//       state.products = []
//       state.product = null
//       state.isLoading = false
//       state.error = null
//       state.success = null
//       state.productsBySupplierUserId = {}
//       state.loadingBySupplierUserId = {}
//       state.errorBySupplierUserId = {}
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // CREATE
//       .addCase(createProduct.pending, (state) => {
//         state.isLoading = true
//         state.error = null
//         state.success = null
//       })
//       .addCase(createProduct.fulfilled, (state, action) => {
//         state.isLoading = false
//         state.product = action.payload
//         state.success = 'Product created successfully'
//       })
//       .addCase(createProduct.rejected, (state, action) => {
//         state.isLoading = false
//         state.error = action.payload
//       })

//       // LIST ALL
//       .addCase(listProducts.pending, (state) => {
//         state.isLoading = true
//         state.error = null
//       })
//       .addCase(listProducts.fulfilled, (state, action) => {
//         state.isLoading = false
//         state.products = action.payload
//       })
//       .addCase(listProducts.rejected, (state, action) => {
//         state.isLoading = false
//         state.error = action.payload
//       })

//       // GET ONE
//       .addCase(getProduct.pending, (state) => {
//         state.isLoading = true
//         state.error = null
//       })
//       .addCase(getProduct.fulfilled, (state, action) => {
//         state.isLoading = false
//         state.product = action.payload
//       })
//       .addCase(getProduct.rejected, (state, action) => {
//         state.isLoading = false
//         state.error = action.payload
//       })

//       // LIST BY SUPPLIER USER ID
//       .addCase(listProductsBySupplier.pending, (state, action) => {
//         const supplierUserId = action.meta.arg
//         state.loadingBySupplierUserId[supplierUserId] = true
//         state.errorBySupplierUserId[supplierUserId] = null
//       })
//       .addCase(listProductsBySupplier.fulfilled, (state, action) => {
//         const { supplierUserId, products } = action.payload
//         state.loadingBySupplierUserId[supplierUserId] = false
//         state.productsBySupplierUserId[supplierUserId] = products
//       })
//       .addCase(listProductsBySupplier.rejected, (state, action) => {
//         const { supplierUserId, error } = action.payload || {}
//         if (supplierUserId != null) {
//           state.loadingBySupplierUserId[supplierUserId] = false
//           state.errorBySupplierUserId[supplierUserId] = error || { detail: 'Failed to fetch supplier products' }
//         } else {
//           state.error = action.payload
//         }
//       })
//   },
// })

// export const { clearProductState } = productSlice.actions
// export default productSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../axiosInstance'

// CREATE product (unchanged)
export const createProduct = createAsyncThunk(
  'product/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/products/create/', productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to create product' })
    }
  }
)

// LIST all products (unchanged)
export const listProducts = createAsyncThunk(
  'product/list',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/products/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch products' })
    }
  }
)

// GET single product (unchanged)
export const getProduct = createAsyncThunk(
  'product/get',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/products/${productId}/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch product' })
    }
  }
)

// LIST products by supplier USER id (keyed)
export const listProductsBySupplier = createAsyncThunk(
  'product/listBySupplier',
  async (supplierUserId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/products/supplier/${supplierUserId}/`)
      return { supplierUserId, products: response.data }
    } catch (error) {
      return rejectWithValue({
        supplierUserId,
        error: error.response?.data || { detail: 'Failed to fetch supplier products' },
      })
    }
  }
)

// UPDATE product (PATCH), supports FormData for image
export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      const res = await axios.patch(`/products/${id}/`, data, config)
      return res.data // updated product
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to update product' })
    }
  }
)

// DELETE product
export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/products/${id}/`)
      return { id }
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to delete product' })
    }
  }
)

const initialState = {
  products: [],
  product: null,
  isLoading: false,
  error: null,
  success: null,

  // keyed by supplierUserId
  productsBySupplierUserId: {},   // { [supplierUserId]: Product[] }
  loadingBySupplierUserId: {},    // { [supplierUserId]: boolean }
  errorBySupplierUserId: {},      // { [supplierUserId]: any }
}

// helpers to mutate state safely (Immer lets us "mutate")
function replaceInArray(arr, item) {
  const i = arr.findIndex(p => p.id === item.id)
  if (i !== -1) arr[i] = item
}
function removeFromArray(arr, id) {
  const i = arr.findIndex(p => p.id === id)
  if (i !== -1) arr.splice(i, 1)
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductState: (state) => {
      state.products = []
      state.product = null
      state.isLoading = false
      state.error = null
      state.success = null
      state.productsBySupplierUserId = {}
      state.loadingBySupplierUserId = {}
      state.errorBySupplierUserId = {}
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
        // Optional: put it into products array and keyed bucket if you know the supplierUserId is the same
        const created = action.payload
        if (created) {
          // global
          state.products.push(created)
          // keyed
          const key = String(created.supplier ?? '')
          if (key) {
            if (!Array.isArray(state.productsBySupplierUserId[key])) {
              state.productsBySupplierUserId[key] = []
            }
            state.productsBySupplierUserId[key].push(created)
          }
        }
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

      // LIST BY SUPPLIER USER ID
      .addCase(listProductsBySupplier.pending, (state, action) => {
        const supplierUserId = action.meta.arg
        state.loadingBySupplierUserId[supplierUserId] = true
        state.errorBySupplierUserId[supplierUserId] = null
      })
      .addCase(listProductsBySupplier.fulfilled, (state, action) => {
        const { supplierUserId, products } = action.payload
        state.loadingBySupplierUserId[supplierUserId] = false
        state.productsBySupplierUserId[supplierUserId] = products
      })
      .addCase(listProductsBySupplier.rejected, (state, action) => {
        const { supplierUserId, error } = action.payload || {}
        if (supplierUserId != null) {
          state.loadingBySupplierUserId[supplierUserId] = false
          state.errorBySupplierUserId[supplierUserId] = error || { detail: 'Failed to fetch supplier products' }
        } else {
          state.error = action.payload
        }
      })

      // UPDATE
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = 'Product updated successfully'
        const updated = action.payload
        if (!updated) return

        // update "current" product if open
        if (state.product?.id === updated.id) {
          state.product = updated
        }

        // update global list
        replaceInArray(state.products, updated)

        // remove from any keyed bucket it exists in, then add/update in its own bucket
        const newKey = String(updated.supplier ?? '')
        for (const key of Object.keys(state.productsBySupplierUserId)) {
          const bucket = state.productsBySupplierUserId[key]
          if (Array.isArray(bucket)) {
            const idx = bucket.findIndex(p => p.id === updated.id)
            if (idx !== -1) {
              // if same bucket as newKey, replace, else remove (supplier changed)
              if (key === newKey) {
                bucket[idx] = updated
              } else {
                bucket.splice(idx, 1)
              }
            }
          }
        }
        if (newKey) {
          if (!Array.isArray(state.productsBySupplierUserId[newKey])) {
            state.productsBySupplierUserId[newKey] = []
          }
          // ensure it exists or push
          const target = state.productsBySupplierUserId[newKey]
          const idx = target.findIndex(p => p.id === updated.id)
          if (idx !== -1) target[idx] = updated
          else target.push(updated)
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = 'Product deleted successfully'
        const { id } = action.payload || {}
        if (id == null) return

        // clear current product if it was deleted
        if (state.product?.id === id) {
          state.product = null
        }

        // remove from global list
        removeFromArray(state.products, id)

        // remove from all keyed buckets
        for (const key of Object.keys(state.productsBySupplierUserId)) {
          const bucket = state.productsBySupplierUserId[key]
          if (Array.isArray(bucket)) removeFromArray(bucket, id)
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearProductState } = productSlice.actions
export default productSlice.reducer