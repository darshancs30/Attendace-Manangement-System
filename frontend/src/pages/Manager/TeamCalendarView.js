import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import './TeamCalendarView.css';

const TeamCalendarView = () => {
  const dispatch = useDispatch();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const startDate = format(
      startOfMonth(new Date(selectedYear, selectedMonth - 1)),
      'yyyy-MM-dd'
    );
    const endDate = format(
      endOfMonth(new Date(selectedYear, selectedMonth - 1)),
      'yyyy-MM-dd'
    );

    dispatch(
      getAllAttendance({
        startDate,
        endDate,
        employeeId: selectedEmployee || undefined,
      })
    );
  }, [dispatch, selectedMonth, selectedYear, selectedEmployee]);

  // Get unique employees from attendance data
  const employees = Array.from(
    new Set(
      allAttendance
        ?.map((record) => record.userId?.employeeId)
        .filter((id) => id)
    )
  );

  // Generate calendar grid
  const generateCalendar = () => {
    const firstDay = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));
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
      const dayAttendance = allAttendance?.filter((record) => {
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
        attendance: dayAttendance || [],
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

  const getDayStatus = (dayAttendance) => {
    if (!dayAttendance || dayAttendance.length === 0) {
      return 'no-data';
    }

    const presentCount = dayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    const totalCount = dayAttendance.length;

    if (presentCount === totalCount) {
      return 'all-present';
    } else if (presentCount === 0) {
      return 'all-absent';
    } else {
      return 'partial';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Team Calendar View</h1>

      {/* Filters */}
      <div className="card">
        <div className="calendar-filters">
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
            <label>Employee:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((empId) => (
                <option key={empId} value={empId}>
                  {empId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <h3>Attendance Calendar</h3>
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

                const status = getDayStatus(day.attendance);
                const attendanceCount = day.attendance.length;
                const presentCount = day.attendance.filter(
                  (a) => a.status === 'present' || a.status === 'late'
                ).length;

                return (
                  <div key={dayIndex} className={`calendar-day ${status}`}>
                    <div className="calendar-day-number">{day.day}</div>
                    {attendanceCount > 0 && (
                      <div className="calendar-day-stats">
                        <div className="stats-text">
                          {presentCount}/{attendanceCount}
                        </div>
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
            <div className="legend-color all-present"></div>
            <span>All Present</span>
          </div>
          <div className="legend-item">
            <div className="legend-color partial"></div>
            <span>Partial</span>
          </div>
          <div className="legend-item">
            <div className="legend-color all-absent"></div>
            <span>All Absent</span>
          </div>
          <div className="legend-item">
            <div className="legend-color no-data"></div>
            <span>No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendarView;

