import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getEmployeeDashboard = createAsyncThunk(
  'dashboard/getEmployeeDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/employee`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get dashboard'
      );
    }
  }
);

export const getManagerDashboard = createAsyncThunk(
  'dashboard/getManagerDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/manager`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get dashboard'
      );
    }
  }
);

const initialState = {
  employeeDashboard: null,
  managerDashboard: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployeeDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeDashboard = action.payload;
      })
      .addCase(getEmployeeDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getManagerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.managerDashboard = action.payload;
      })
      .addCase(getManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

