import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import './MyAttendanceHistory.css';

const MyAttendanceHistory = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary, loading } = useSelector((state) => state.attendance);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  useEffect(() => {
    dispatch(getMyHistory({ month: selectedMonth, year: selectedYear }));
    dispatch(getMySummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

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

  // Calendar view logic
  const generateCalendar = () => {
    const firstDay = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const lastDay = endOfMonth(new Date(selectedYear, selectedMonth - 1));
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    let week = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      week.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const attendanceRecord = myHistory?.find((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getDate() === day &&
          recordDate.getMonth() === selectedMonth - 1 &&
          recordDate.getFullYear() === selectedYear
        );
      });

      week.push({
        day,
        date,
        attendance: attendanceRecord,
      });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // Fill remaining week
    while (week.length < 7) {
      week.push(null);
    }
    if (week.some((day) => day !== null)) {
      calendar.push(week);
    }

    return calendar;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>My Attendance History</h1>

      {/* Filters and Summary */}
      <div className="card">
        <div className="filters">
          <div className="filter-group">
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
          <div className="filter-group">
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
          <div className="filter-group">
            <label>View:</label>
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button
              className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
          </div>
        </div>

        {mySummary && (
          <div className="summary">
            <h3>Monthly Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Present:</span>
                <span className="summary-value">{mySummary.present}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Absent:</span>
                <span className="summary-value">{mySummary.absent}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Late:</span>
                <span className="summary-value">{mySummary.late}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Hours:</span>
                <span className="summary-value">{mySummary.totalHours?.toFixed(1)} hrs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card">
          <h3>Attendance Records</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {myHistory && myHistory.length > 0 ? (
                myHistory.map((record) => (
                  <tr key={record._id}>
                    <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
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
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card">
          <h3>Calendar View</h3>
          <div className="calendar">
            <div className="calendar-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
            </div>
            {generateCalendar().map((week, weekIndex) => (
              <div key={weekIndex} className="calendar-week">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="calendar-day empty"></div>;
                  }

                  const statusClass = day.attendance
                    ? `calendar-day ${day.attendance.status}`
                    : 'calendar-day';

                  return (
                    <div 
                      key={dayIndex} 
                      className={statusClass}
                      onClick={() => {
                        if (day.attendance) {
                          alert(
                            `Date: ${format(day.date, 'MMM dd, yyyy')}\n` +
                            `Status: ${day.attendance.status}\n` +
                            `Check In: ${day.attendance.checkInTime ? format(new Date(day.attendance.checkInTime), 'hh:mm a') : 'N/A'}\n` +
                            `Check Out: ${day.attendance.checkOutTime ? format(new Date(day.attendance.checkOutTime), 'hh:mm a') : 'N/A'}\n` +
                            `Total Hours: ${day.attendance.totalHours || 0} hrs`
                          );
                        }
                      }}
                      style={{ cursor: day.attendance ? 'pointer' : 'default' }}
                      title={day.attendance ? `Click to see details for ${format(day.date, 'MMM dd, yyyy')}` : ''}
                    >
                      <div className="calendar-day-number">{day.day}</div>
                      {day.attendance && (
                        <div className="calendar-day-status">
                          {day.attendance.status === 'present' && '✓'}
                          {day.attendance.status === 'absent' && '✗'}
                          {day.attendance.status === 'late' && 'L'}
                          {day.attendance.status === 'half-day' && 'H'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color present"></div>
              <span>Present</span>
            </div>
            <div className="legend-item">
              <div className="legend-color absent"></div>
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <div className="legend-color late"></div>
              <span>Late</span>
            </div>
            <div className="legend-item">
              <div className="legend-color half-day"></div>
              <span>Half Day</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAttendanceHistory;

