import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { showToast } from '../../store/slices/toastSlice';
import { format } from 'date-fns';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus, loading, error } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    try {
      const result = await dispatch(checkIn());
      if (result.type === 'attendance/checkIn/fulfilled') {
        dispatch(showToast('Successfully checked in!', 'success'));
        dispatch(getTodayStatus());
      } else if (result.type === 'attendance/checkIn/rejected') {
        dispatch(showToast(result.payload || 'Check-in failed', 'error'));
      }
    } catch (error) {
      dispatch(showToast('An error occurred', 'error'));
    }
  };

  const handleCheckOut = async () => {
    try {
      const result = await dispatch(checkOut());
      if (result.type === 'attendance/checkOut/fulfilled') {
        dispatch(showToast('Successfully checked out!', 'success'));
        dispatch(getTodayStatus());
      } else if (result.type === 'attendance/checkOut/rejected') {
        dispatch(showToast(result.payload || 'Check-out failed', 'error'));
      }
    } catch (error) {
      dispatch(showToast('An error occurred', 'error'));
    }
  };

  return (
    <div className="container">
      <h1>Mark Attendance</h1>
      <div className="attendance-card">
        <div className="attendance-header">
          <h2>Today - {format(new Date(), 'MMMM dd, yyyy')}</h2>
          <div className={`status-indicator ${todayStatus?.status || 'absent'}`}>
            {todayStatus?.status?.toUpperCase() || 'NOT CHECKED IN'}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="attendance-actions">
          {!todayStatus?.checkedIn ? (
            <button
              onClick={handleCheckIn}
              className="btn btn-success btn-large"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Check In'}
            </button>
          ) : !todayStatus?.checkedOut ? (
            <button
              onClick={handleCheckOut}
              className="btn btn-danger btn-large"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          ) : (
            <div className="completed-status">
              <p className="success">You have completed your attendance for today!</p>
              {todayStatus?.checkInTime && (
                <p>
                  Check In: {format(new Date(todayStatus.checkInTime), 'hh:mm:ss a')}
                </p>
              )}
              {todayStatus?.checkOutTime && (
                <p>
                  Check Out: {format(new Date(todayStatus.checkOutTime), 'hh:mm:ss a')}
                </p>
              )}
              {todayStatus?.totalHours > 0 && (
                <p className="total-hours">
                  Total Hours: {todayStatus.totalHours} hrs
                </p>
              )}
            </div>
          )}
        </div>

        {todayStatus?.checkedIn && !todayStatus?.checkedOut && (
          <div className="current-status">
            <p>
              Checked in at: {format(new Date(todayStatus.checkInTime), 'hh:mm:ss a')}
            </p>
            <p className="info">Click "Check Out" when you finish your work.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;

