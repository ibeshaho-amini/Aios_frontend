import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axiosInstance'; // Make sure this sets Authorization header!

// CREATE supplier
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

// LIST all suppliers
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

// GET single supplier
export const getSupplier = createAsyncThunk(
  'supplier/get',
  async (supplierId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/suppliers/${supplierId}/`);
      return response.data;
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

      // GET
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
      });
  },
});

export const { clearSupplierState } = supplierSlice.actions;
export default supplierSlice.reducer;