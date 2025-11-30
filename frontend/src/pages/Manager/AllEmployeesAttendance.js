import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import './AllEmployeesAttendance.css';

const AllEmployeesAttendance = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    employeeId: searchParams.get('employeeId') || '',
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
    department: searchParams.get('department') || '',
  });

  useEffect(() => {
    dispatch(getAllAttendance(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
      <h1>All Employees Attendance</h1>

      {/* Filters */}
      <div className="card">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="e.g., EMP001"
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
      </div>

      {/* Attendance Table */}
      <div className="card">
        <h3>Attendance Records</h3>
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
                  <th>Department</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
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
                      <td>{record.userId?.department}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
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
                      <td>{record.totalHours || 0} hrs</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>
                      No attendance records found
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

export default AllEmployeesAttendance;

