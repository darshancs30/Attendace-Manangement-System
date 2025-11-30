import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/employee/login');
  };

  const isManager = user?.role === 'manager';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={isManager ? '/manager/dashboard' : '/employee/dashboard'}>
            Attendance System
          </Link>
        </div>
        <div className="navbar-menu">
          {isManager ? (
            <>
              <Link
                to="/manager/dashboard"
                className={location.pathname === '/manager/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link
                to="/manager/employees"
                className={location.pathname === '/manager/employees' ? 'active' : ''}
              >
                Employees
              </Link>
              <Link
                to="/manager/attendance"
                className={location.pathname === '/manager/attendance' ? 'active' : ''}
              >
                All Attendance
              </Link>
              <Link
                to="/manager/calendar"
                className={location.pathname === '/manager/calendar' ? 'active' : ''}
              >
                Calendar
              </Link>
              <Link
                to="/manager/summary"
                className={location.pathname === '/manager/summary' ? 'active' : ''}
              >
                Team Summary
              </Link>
              <Link
                to="/manager/reports"
                className={location.pathname === '/manager/reports' ? 'active' : ''}
              >
                Reports
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/employee/dashboard"
                className={location.pathname === '/employee/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link
                to="/employee/mark-attendance"
                className={location.pathname === '/employee/mark-attendance' ? 'active' : ''}
              >
                Mark Attendance
              </Link>
              <Link
                to="/employee/history"
                className={location.pathname === '/employee/history' ? 'active' : ''}
              >
                My History
              </Link>
              <Link
                to="/employee/profile"
                className={location.pathname === '/employee/profile' ? 'active' : ''}
              >
                Profile
              </Link>
            </>
          )}
          <div className="navbar-user">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

