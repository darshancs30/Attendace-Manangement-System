import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const { message, type = 'info', duration = 3000 } = action.payload;
      const id = Date.now() + Math.random();
      state.toasts.push({ id, message, type, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;

// Helper function to show toast
export const showToast = (message, type = 'info', duration = 3000) => {
  return (dispatch) => {
    const id = Date.now() + Math.random();
    dispatch(addToast({ id, message, type, duration }));
    
    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeToast(id));
      }, duration);
    }
  };
};

export default toastSlice.reducer;

