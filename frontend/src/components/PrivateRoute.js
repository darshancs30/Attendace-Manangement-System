import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, managerOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/employee/login" />;
  }

  if (managerOnly && user.role !== 'manager') {
    return <Navigate to="/employee/dashboard" />;
  }

  if (!managerOnly && user.role === 'manager') {
    return <Navigate to="/manager/dashboard" />;
  }

  return children;
};

export default PrivateRoute;

