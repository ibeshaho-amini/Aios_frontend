// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from '../axiosInstance'; // Make sure this sets Authorization header!

// // CREATE supplier
// export const createSupplier = createAsyncThunk(
//   'supplier/create',
//   async (supplierData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/suppliers/create/', supplierData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to create supplier' });
//     }
//   }
// );

// // LIST all suppliers
// export const listSuppliers = createAsyncThunk(
//   'supplier/list',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get('/suppliers/');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to fetch suppliers' });
//     }
//   }
// );

// // GET single supplier
// export const getSupplier = createAsyncThunk(
//   'supplier/get',
//   async (supplierId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`/suppliers/${supplierId}/`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to fetch supplier' });
//     }
//   }
// );

// export const updateSupplier = createAsyncThunk(
//   'supplier/update',
//   async ({ supplierId, data }, { rejectWithValue }) => {
//     try {
//       const res = await axios.patch(`/suppliers/${supplierId}/`, data)
//       return res.data
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { detail: 'Failed to update supplier' })
//     }
//   }
// )
// const initialState = {
//   suppliers: [],
//   supplier: null,
//   isLoading: false,
//   error: null,
//   success: null,
// };

// const supplierSlice = createSlice({
//   name: 'supplier',
//   initialState,
//   reducers: {
//     clearSupplierState: (state) => {
//       state.suppliers = [];
//       state.supplier = null;
//       state.isLoading = false;
//       state.error = null;
//       state.success = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // CREATE
//       .addCase(createSupplier.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//         state.success = null;
//       })
//       .addCase(createSupplier.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.supplier = action.payload;
//         state.success = 'Supplier created successfully';
//       })
//       .addCase(createSupplier.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       // LIST
//       .addCase(listSuppliers.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(listSuppliers.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.suppliers = action.payload;
//       })
//       .addCase(listSuppliers.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       // GET
//       .addCase(getSupplier.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(getSupplier.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.supplier = action.payload;
//       })
//       .addCase(getSupplier.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       .addCase(updateSupplier.pending, (state) => {
//     state.isLoading = true
//     state.error = null
//     state.success = null
//   })
//   .addCase(updateSupplier.fulfilled, (state, action) => {
//     state.isLoading = false
//     state.supplier = action.payload
//     state.success = 'Supplier updated successfully'
//   })
//   .addCase(updateSupplier.rejected, (state, action) => {
//     state.isLoading = false
//     state.error = action.payload
//   })
//   },
// });

// export const { clearSupplierState } = supplierSlice.actions;
// export default supplierSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axiosInstance'; // Must set Authorization header

// CREATE supplier (unchanged)
export const createSupplier = createAsyncThunk(
  'supplier/create',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/suppliers/create/', supplierData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to create supplier' });
    }
  }
);

// LIST all suppliers (unchanged)
export const listSuppliers = createAsyncThunk(
  'supplier/list',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/suppliers/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch suppliers' });
    }
  }
);

// GET supplier by user_id (NOTE: pass userId, not supplier pk)
// If userId is not passed, fallback to localStorage user_id for convenience
export const getSupplier = createAsyncThunk(
  'supplier/get',
  async (userId, { rejectWithValue }) => {
    try {
      const id = parseInt(localStorage.getItem('user_id'));
      console.log("id is:",id)
      const response = await axios.get(`/suppliers/${id}/`);
      return response.data;
    } catch (error) {
      // Backend may return {error: 'Supplier not found'} or {detail: ...}
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch supplier' });
    }
  }
);

// UPDATE supplier by user_id (PATCH partial update)
// payload: { userId, data } — if userId omitted, fallback to localStorage
export const updateSupplier = createAsyncThunk(
  'supplier/update',
  async ({ userId, data } = {}, { rejectWithValue }) => {
    try {
      const id = userId ?? Number(localStorage.getItem('user_id'));
      const res = await axios.patch(`/suppliers/${id}/`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to update supplier' });
    }
  }
);

// Optional convenience: fetch current user's supplier without passing id
export const fetchMySupplier = createAsyncThunk(
  'supplier/me',
  async (_, { rejectWithValue }) => {
    try {
      const id = Number(localStorage.getItem('user_id'));
      const res = await axios.get(`/suppliers/${id}/`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch supplier' });
    }
  }
);

const initialState = {
  suppliers: [],
  supplier: null,
  isLoading: false,
  error: null,
  success: null,
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    clearSupplierState: (state) => {
      state.suppliers = [];
      state.supplier = null;
      state.isLoading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supplier = action.payload;
        state.success = 'Supplier created successfully';
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // LIST
      .addCase(listSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload;
      })
      .addCase(listSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // GET by user_id
      .addCase(getSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supplier = action.payload;
      })
      .addCase(getSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchMySupplier (optional)
      .addCase(fetchMySupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supplier = action.payload;
      })
      .addCase(fetchMySupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // UPDATE by user_id
      .addCase(updateSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supplier = action.payload;
        state.success = 'Supplier updated successfully';
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
  },
});

export const { clearSupplierState } = supplierSlice.actions;
export default supplierSlice.reducer;