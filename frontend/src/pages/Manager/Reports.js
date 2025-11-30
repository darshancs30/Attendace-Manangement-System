import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { exportAttendance, getAllAttendance } from '../../store/slices/attendanceSlice';
import { showToast } from '../../store/slices/toastSlice';
import { format } from 'date-fns';
import './Reports.css';

const Reports = () => {
  const dispatch = useDispatch();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
    department: '',
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    dispatch(getAllAttendance(filters));
  };

  const handleExport = async () => {
    try {
      const result = await dispatch(exportAttendance(filters));
      if (result.type === 'attendance/exportAttendance/fulfilled') {
        // Create blob and download
        const blob = new Blob([result.payload], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        dispatch(showToast('Report exported successfully!', 'success'));
      } else if (result.type === 'attendance/exportAttendance/rejected') {
        dispatch(showToast(result.payload || 'Export failed', 'error'));
      }
    } catch (error) {
      dispatch(showToast('An error occurred during export', 'error'));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present':
        return 'badge-success';
      case 'absent':
        return 'badge-danger';
      case 'late':
        return 'badge-warning';
      case 'half-day':
        return 'badge-info';
      default:
        return '';
    }
  };

  return (
    <div className="container">
      <h1>Attendance Reports</h1>

      {/* Filters */}
      <div className="card">
        <h3>Report Filters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="e.g., EMP001 (leave empty for all)"
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              placeholder="e.g., Engineering"
            />
          </div>
        </div>
        <div className="report-actions">
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
          <button onClick={handleExport} className="btn btn-success">
            Export to CSV
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="card">
        <h3>Report Results</h3>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {allAttendance && allAttendance.length > 0 ? (
                  allAttendance.map((record) => (
                    <tr key={record._id}>
                      <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                      <td>{record.userId?.employeeId}</td>
                      <td>{record.userId?.name}</td>
                      <td>{record.userId?.email}</td>
                      <td>{record.userId?.department}</td>
                      <td>
                        {record.checkInTime
                          ? format(new Date(record.checkInTime), 'hh:mm a')
                          : '-'}
                      </td>
                      <td>
                        {record.checkOutTime
                          ? format(new Date(record.checkOutTime), 'hh:mm a')
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.totalHours || 0} hrs</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>
                      No records found. Click "Search" to load data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

