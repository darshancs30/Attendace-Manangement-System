import mongoose from 'mongoose';

/**
 * Attendance Schema
 * Tracks daily attendance records for users
 */
const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
  },
  checkInTime: {
    type: Date,
    validate: {
      validator: function (value) {
        // Check-in time should be before check-out time if both exist
        if (this.checkOutTime && value) {
          return value < this.checkOutTime;
        }
        return true;
      },
      message: 'Check-in time must be before check-out time',
    },
  },
  checkOutTime: {
    type: Date,
    validate: {
      validator: function (value) {
        // Check-out time should be after check-in time if both exist
        if (this.checkInTime && value) {
          return value > this.checkInTime;
        }
        return true;
      },
      message: 'Check-out time must be after check-in time',
    },
  },
  status: {
    type: String,
    enum: {
      values: ['present', 'absent', 'late', 'half-day'],
      message: 'Status must be present, absent, late, or half-day',
    },
    default: 'absent',
    index: true,
  },
  totalHours: {
    type: Number,
    default: 0,
    min: [0, 'Total hours cannot be negative'],
    max: [24, 'Total hours cannot exceed 24 hours'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Compound unique index to ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Additional indexes for better query performance
attendanceSchema.index({ date: -1 }); // For sorting by date
attendanceSchema.index({ status: 1, date: -1 }); // For filtering by status

/**
 * Calculate total hours before saving
 * Automatically calculates based on check-in and check-out times
 */
attendanceSchema.pre('save', function (next) {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    
    // Validate total hours
    if (this.totalHours < 0) {
      return next(new Error('Invalid time calculation: check-out must be after check-in'));
    }
    if (this.totalHours > 24) {
      return next(new Error('Invalid time calculation: total hours cannot exceed 24'));
    }
  } else {
    this.totalHours = 0;
  }
  next();
});

/**
 * Virtual for formatted date string
 */
attendanceSchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});

export default mongoose.model('Attendance', attendanceSchema);
