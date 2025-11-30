import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeamSummary } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import './TeamSummary.css';

const TeamSummary = () => {
  const dispatch = useDispatch();
  const { teamSummary, loading } = useSelector((state) => state.attendance);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getTeamSummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Team Attendance Summary</h1>

      {/* Month/Year Selector */}
      <div className="card">
        <div className="summary-filters">
          <div className="form-group">
            <label>Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {format(new Date(selectedYear, month - 1), 'MMMM')}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {teamSummary && (
        <div className="card">
          <h2>
            Summary for {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
          </h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Total Employees</div>
              <div className="summary-value-large">{teamSummary.totalEmployees || 0}</div>
            </div>
            <div className="summary-card success">
              <div className="summary-label">Present Days</div>
              <div className="summary-value-large">{teamSummary.present || 0}</div>
            </div>
            <div className="summary-card danger">
              <div className="summary-label">Absent Days</div>
              <div className="summary-value-large">{teamSummary.absent || 0}</div>
            </div>
            <div className="summary-card warning">
              <div className="summary-label">Late Arrivals</div>
              <div className="summary-value-large">{teamSummary.late || 0}</div>
            </div>
            <div className="summary-card info">
              <div className="summary-label">Half Days</div>
              <div className="summary-value-large">{teamSummary.halfDay || 0}</div>
            </div>
            <div className="summary-card primary">
              <div className="summary-label">Total Hours</div>
              <div className="summary-value-large">
                {teamSummary.totalHours?.toFixed(1) || 0} hrs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="card">
        <h3>Summary Details</h3>
        <div className="summary-details">
          <p>
            <strong>Period:</strong> {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
          </p>
          <p>
            <strong>Total Attendance Records:</strong> {teamSummary?.totalDays || 0}
          </p>
          {teamSummary && teamSummary.totalEmployees > 0 && (
            <p>
              <strong>Average Hours per Employee:</strong>{' '}
              {((teamSummary.totalHours || 0) / teamSummary.totalEmployees).toFixed(2)} hrs
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSummary;

