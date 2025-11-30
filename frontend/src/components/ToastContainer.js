import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../store/slices/toastSlice';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toast?.toasts || []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

