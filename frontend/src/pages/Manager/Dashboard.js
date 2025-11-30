import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getManagerDashboard } from '../../store/slices/dashboardSlice';
import { getTodayStatusAll } from '../../store/slices/attendanceSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { managerDashboard, loading } = useSelector((state) => state.dashboard);
  const { todayStatusAll } = useSelector((state) => state.attendance);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    dispatch(getManagerDashboard());
    dispatch(getTodayStatusAll());
    fetchDepartments();
  }, [dispatch]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  const dashboard = managerDashboard || {};

  return (
    <div className="container">
      <h1>Manager Dashboard</h1>

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="card stats-card">
          <h3>Total Employees</h3>
          <div className="stat-value-large">{dashboard.totalEmployees || 0}</div>
        </div>

        <div className="card stats-card">
          <h3>Today's Attendance</h3>
          <div className="stats-inline">
            <div className="stat-item-inline">
              <div className="stat-label">Present</div>
              <div className="stat-value">{dashboard.todayStats?.present || 0}</div>
            </div>
            <div className="stat-item-inline">
              <div className="stat-label">Absent</div>
              <div className="stat-value">{dashboard.todayStats?.absent || 0}</div>
            </div>
            <div className="stat-item-inline">
              <div className="stat-label">Late</div>
              <div className="stat-value">{dashboard.todayStats?.late || 0}</div>
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="card chart-card">
          <h3>Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboard.weeklyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#28a745" name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#dc3545" name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Stats Chart */}
        <div className="card chart-card">
          <h3>Department-wise Attendance (Today)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboard.departmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#28a745" name="Present" />
              <Bar dataKey="absent" fill="#dc3545" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Absent Employees Today */}
        <div className="card absent-card">
          <h3>Absent Employees Today</h3>
          {dashboard.absentEmployeesToday && dashboard.absentEmployeesToday.length > 0 ? (
            <div className="absent-list">
              {dashboard.absentEmployeesToday.map((employee) => (
                <div key={employee._id} className="absent-item">
                  <div>
                    <strong>{employee.name}</strong>
                    <span className="employee-id">{employee.employeeId}</span>
                  </div>
                  <span className="department-badge">{employee.department}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-absent">All employees are present today!</p>
          )}
        </div>

        {/* Departments Overview */}
        <div className="card departments-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Departments</h3>
            <Link to="/manager/employees" className="btn btn-primary btn-sm">
              View All Employees
            </Link>
          </div>
          {departments.length > 0 ? (
            <div className="departments-list">
              {departments.map((dept, index) => (
                <div key={index} className="department-item">
                  <div>
                    <strong>{dept.department}</strong>
                    <span className="employee-count">{dept.employeeCount} employees</span>
                  </div>
                  <Link
                    to={`/manager/attendance?department=${encodeURIComponent(dept.department)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Attendance
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No departments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

