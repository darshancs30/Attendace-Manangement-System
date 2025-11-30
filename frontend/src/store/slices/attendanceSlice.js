import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Employee attendance thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/attendance/checkin`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Check-in failed'
      );
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/attendance/checkout`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Check-out failed'
      );
    }
  }
);

export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/attendance/today`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get today status'
      );
    }
  }
);

export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = month && year ? { month, year } : {};
      const response = await axios.get(`${API_URL}/attendance/my-history`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get history'
      );
    }
  }
);

export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = month && year ? { month, year } : {};
      const response = await axios.get(`${API_URL}/attendance/my-summary`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get summary'
      );
    }
  }
);

// Manager attendance thunks
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/all`, {
        ...getAuthHeaders(),
        params: filters,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get attendance'
      );
    }
  }
);

export const getEmployeeAttendance = createAsyncThunk(
  'attendance/getEmployeeAttendance',
  async ({ id, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/employee/${id}`, {
        ...getAuthHeaders(),
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get employee attendance'
      );
    }
  }
);

export const getTeamSummary = createAsyncThunk(
  'attendance/getTeamSummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = month && year ? { month, year } : {};
      const response = await axios.get(`${API_URL}/attendance/summary`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get team summary'
      );
    }
  }
);

export const getTodayStatusAll = createAsyncThunk(
  'attendance/getTodayStatusAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/attendance/today-status`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get today status'
      );
    }
  }
);

export const exportAttendance = createAsyncThunk(
  'attendance/exportAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Export failed'
      );
    }
  }
);

const initialState = {
  todayStatus: null,
  myHistory: [],
  mySummary: null,
  allAttendance: [],
  teamSummary: null,
  todayStatusAll: null,
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAttendance: (state) => {
      state.allAttendance = [];
      state.teamSummary = null;
      state.todayStatusAll = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Today Status
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload;
      })
      // Get My History
      .addCase(getMyHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.myHistory = action.payload;
      })
      .addCase(getMyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Summary
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.mySummary = action.payload;
      })
      // Get All Attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Team Summary
      .addCase(getTeamSummary.fulfilled, (state, action) => {
        state.teamSummary = action.payload;
      })
      // Get Today Status All
      .addCase(getTodayStatusAll.fulfilled, (state, action) => {
        state.todayStatusAll = action.payload;
      });
  },
});

export const { clearError, clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;

