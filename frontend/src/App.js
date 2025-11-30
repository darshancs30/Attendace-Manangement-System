import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';

// Employee Pages
import EmployeeLogin from './pages/Employee/Login';
import EmployeeRegister from './pages/Employee/Register';
import EmployeeDashboard from './pages/Employee/Dashboard';
import MarkAttendance from './pages/Employee/MarkAttendance';
import MyAttendanceHistory from './pages/Employee/MyAttendanceHistory';
import EmployeeProfile from './pages/Employee/Profile';

// Manager Pages
import ManagerLogin from './pages/Manager/Login';
import ManagerDashboard from './pages/Manager/Dashboard';
import AllEmployeesAttendance from './pages/Manager/AllEmployeesAttendance';
import TeamCalendarView from './pages/Manager/TeamCalendarView';
import Reports from './pages/Manager/Reports';
import Employees from './pages/Manager/Employees';
import TeamSummary from './pages/Manager/TeamSummary';

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  return (
    <div className="App">
      {user && <Navbar />}
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/employee/login"
          element={!user ? <EmployeeLogin /> : <Navigate to="/employee/dashboard" />}
        />
        <Route
          path="/employee/register"
          element={!user ? <EmployeeRegister /> : <Navigate to="/employee/dashboard" />}
        />
        <Route
          path="/manager/login"
          element={
            !user ? (
              <ManagerLogin />
            ) : user.role === 'manager' ? (
              <Navigate to="/manager/dashboard" />
            ) : (
              <Navigate to="/employee/dashboard" />
            )
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <PrivateRoute>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/mark-attendance"
          element={
            <PrivateRoute>
              <MarkAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/history"
          element={
            <PrivateRoute>
              <MyAttendanceHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <PrivateRoute>
              <EmployeeProfile />
            </PrivateRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute managerOnly>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/attendance"
          element={
            <PrivateRoute managerOnly>
              <AllEmployeesAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/calendar"
          element={
            <PrivateRoute managerOnly>
              <TeamCalendarView />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <PrivateRoute managerOnly>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/employees"
          element={
            <PrivateRoute managerOnly>
              <Employees />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/summary"
          element={
            <PrivateRoute managerOnly>
              <TeamSummary />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'manager' ? (
                <Navigate to="/manager/dashboard" />
              ) : (
                <Navigate to="/employee/dashboard" />
              )
            ) : (
              <Navigate to="/employee/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;

