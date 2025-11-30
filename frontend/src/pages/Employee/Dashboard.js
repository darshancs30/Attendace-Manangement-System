import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getEmployeeDashboard } from '../../store/slices/dashboardSlice';
import { getTodayStatus } from '../../store/slices/attendanceSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { employeeDashboard, loading } = useSelector((state) => state.dashboard);
  const { todayStatus } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getEmployeeDashboard());
    dispatch(getTodayStatus());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  const dashboard = employeeDashboard || {};

  return (
    <div className="container">
      <div className="page-header">
        <h1>Employee Dashboard</h1>
        <Link to="/employee/mark-attendance" className="btn btn-primary">
          Mark Attendance
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* Today's Status Card */}
        <div className="card status-card">
          <h3>Today's Status</h3>
          <div className="status-content">
            <div className={`status-badge ${todayStatus?.status || 'absent'}`}>
              {todayStatus?.checkedIn
                ? todayStatus?.checkedOut
                  ? 'Checked Out'
                  : 'Checked In'
                : 'Not Checked In'}
            </div>
            {todayStatus?.checkInTime && (
              <p>
                Check In: {format(new Date(todayStatus.checkInTime), 'hh:mm a')}
              </p>
            )}
            {todayStatus?.checkOutTime && (
              <p>
                Check Out: {format(new Date(todayStatus.checkOutTime), 'hh:mm a')}
              </p>
            )}
            {todayStatus?.totalHours > 0 && (
              <p>Total Hours: {todayStatus.totalHours} hrs</p>
            )}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="card stats-card">
          <h3>This Month</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{dashboard.monthlyStats?.present || 0}</div>
              <div className="stat-label">Present</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{dashboard.monthlyStats?.absent || 0}</div>
              <div className="stat-label">Absent</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{dashboard.monthlyStats?.late || 0}</div>
              <div className="stat-label">Late</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {dashboard.monthlyStats?.totalHours?.toFixed(1) || 0}
              </div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card recent-card">
          <h3>Recent Attendance (Last 7 Days)</h3>
          <div className="recent-list">
            {dashboard.recentAttendance?.length > 0 ? (
              dashboard.recentAttendance.map((record, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-date">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </div>
                  <div className={`badge badge-${record.status}`}>
                    {record.status}
                  </div>
                  {record.checkInTime && (
                    <div className="recent-time">
                      {format(new Date(record.checkInTime), 'hh:mm a')} -{' '}
                      {record.checkOutTime
                        ? format(new Date(record.checkOutTime), 'hh:mm a')
                        : 'N/A'}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No recent attendance records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

