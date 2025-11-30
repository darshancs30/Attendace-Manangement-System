import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { protect, managerOnly } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @route   POST /api/attendance/checkin
// @desc    Employee check in
// @access  Private (Employee)
router.post('/checkin', protect, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Check if it's late (after 9:30 AM)
    const checkInTime = new Date();
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 30, 0, 0);
    
    let status = 'present';
    if (checkInTime > lateThreshold) {
      status = 'late';
    }

    if (attendance) {
      attendance.checkInTime = checkInTime;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        userId: req.user._id,
        date: today,
        checkInTime: checkInTime,
        status: status,
      });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Employee check out
// @access  Private (Employee)
router.post('/checkout', protect, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.json({
        checkedIn: false,
        checkedOut: false,
        status: 'absent',
      });
    }

    res.json({
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
      totalHours: attendance.totalHours,
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get employee's attendance history
// @access  Private (Employee)
router.get('/my-history', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .select('-createdAt -__v');

    res.json(attendance);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get employee's monthly summary
// @access  Private (Employee)
router.get('/my-summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const halfDay = attendance.filter((a) => a.status === 'half-day').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

    res.json({
      month: targetMonth,
      year: targetYear,
      present,
      absent,
      late,
      halfDay,
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays: attendance.length,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all employees attendance (Manager)
// @access  Private (Manager)
router.get('/all', protect, managerOnly, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status, department } = req.query;
    let query = {};

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    let attendanceQuery = Attendance.find(query);

    // Employee filter
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        attendanceQuery = attendanceQuery.where('userId').equals(user._id);
      } else {
        return res.json([]);
      }
    }

    // Department filter
    if (department) {
      const users = await User.find({ department });
      const userIds = users.map((u) => u._id);
      attendanceQuery = attendanceQuery.where('userId').in(userIds);
    }

    const attendance = await attendanceQuery
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .select('-createdAt -__v');

    res.json(attendance);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee attendance (Manager)
// @access  Private (Manager)
router.get('/employee/:id', protect, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let query = { userId: id };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .select('-createdAt -__v');

    res.json(attendance);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary (Manager)
// @access  Private (Manager)
router.get('/summary', protect, managerOnly, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('userId', 'name employeeId department');

    const summary = {
      month: targetMonth,
      year: targetYear,
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    res.json(summary);
  } catch (error) {
    console.error('Get team summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees (Manager)
// @access  Private (Manager)
router.get('/today-status', protect, managerOnly, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate('userId', 'name email employeeId department');

    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployees = attendance
      .filter((a) => a.status === 'present' || a.status === 'late')
      .map((a) => a.userId);
    const absentEmployees = allEmployees.filter(
      (emp) => !presentEmployees.some((p) => p._id.toString() === emp._id.toString())
    );

    res.json({
      date: today,
      present: attendance.filter((a) => a.status === 'present' || a.status === 'late').length,
      absent: absentEmployees.length,
      late: attendance.filter((a) => a.status === 'late').length,
      presentEmployees: presentEmployees.map((p) => ({
        _id: p._id,
        name: p.name,
        employeeId: p.employeeId,
        department: p.department,
      })),
      absentEmployees: absentEmployees.map((a) => ({
        _id: a._id,
        name: a.name,
        employeeId: a.employeeId,
        department: a.department,
      })),
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance to CSV (Manager)
// @access  Private (Manager)
router.get('/export', protect, managerOnly, async (req, res) => {
  try {
    const { startDate, endDate, employeeId, department } = req.query;
    let query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    let attendanceQuery = Attendance.find(query);

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        attendanceQuery = attendanceQuery.where('userId').equals(user._id);
      } else {
        return res.json([]);
      }
    }

    if (department) {
      const users = await User.find({ department });
      const userIds = users.map((u) => u._id);
      attendanceQuery = attendanceQuery.where('userId').in(userIds);
    }

    const attendance = await attendanceQuery
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Convert to CSV format
    const csvHeader = 'Date,Employee ID,Name,Email,Department,Check In,Check Out,Status,Total Hours\n';
    const csvRows = attendance.map((a) => {
      const date = new Date(a.date).toLocaleDateString();
      const checkIn = a.checkInTime ? new Date(a.checkInTime).toLocaleString() : '';
      const checkOut = a.checkOutTime ? new Date(a.checkOutTime).toLocaleString() : '';
      return `${date},${a.userId.employeeId},${a.userId.name},${a.userId.email},${a.userId.department},${checkIn},${checkOut},${a.status},${a.totalHours || 0}`;
    });

    const csv = csvHeader + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

