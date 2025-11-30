import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import dashboardReducer from './slices/dashboardSlice';
import toastReducer from './slices/toastSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    dashboard: dashboardReducer,
    toast: toastReducer,
  },
});

export default store;

