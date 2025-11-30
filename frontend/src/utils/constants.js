/**
 * Application Constants
 * Centralized constants for the application
 */

// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
};

// Status Colors
export const STATUS_COLORS = {
  present: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
  absent: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
  late: { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' },
  'half-day': { bg: '#ffe5cc', text: '#8b4513', border: '#ffcc99' },
};

// Time Configuration
export const LATE_THRESHOLD_HOUR = 9;
export const LATE_THRESHOLD_MINUTE = 30;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  TIME: 'hh:mm a',
  FULL: 'MMM dd, yyyy hh:mm a',
  ISO: 'yyyy-MM-dd',
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CHECK_IN: 'Successfully checked in!',
  CHECK_OUT: 'Successfully checked out!',
  LOGIN: 'Welcome back!',
  REGISTER: 'Registration successful!',
  EXPORT: 'Report exported successfully!',
};

