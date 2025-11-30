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

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee)
router.get('/employee', protect, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    // Monthly stats
    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const monthlyAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    const present = monthlyAttendance.filter((a) => a.status === 'present').length;
    const absent = monthlyAttendance.filter((a) => a.status === 'absent').length;
    const late = monthlyAttendance.filter((a) => a.status === 'late').length;
    const totalHours = monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: end },
    })
      .sort({ date: -1 })
      .limit(7);

    res.json({
      todayStatus: {
        checkedIn: !!todayAttendance?.checkInTime,
        checkedOut: !!todayAttendance?.checkOutTime,
        status: todayAttendance?.status || 'absent',
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: todayAttendance?.checkOutTime,
      },
      monthlyStats: {
        present,
        absent,
        late,
        totalHours: Math.round(totalHours * 100) / 100,
      },
      recentAttendance: recentAttendance.map((a) => ({
        date: a.date,
        status: a.status,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        totalHours: a.totalHours,
      })),
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard stats
// @access  Private (Manager)
router.get('/manager', protect, managerOnly, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate('userId', 'name employeeId department');

    const presentToday = todayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter((a) => a.status === 'late').length;

    // Absent employees today
    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployeeIds = todayAttendance
      .filter((a) => a.status === 'present' || a.status === 'late')
      .map((a) => a.userId._id.toString());
    const absentEmployees = allEmployees
      .filter((emp) => !presentEmployeeIds.includes(emp._id.toString()))
      .map((emp) => ({
        _id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
      }));

    // Weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo, $lte: end },
    });

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayAttendance = weeklyAttendance.filter((a) => {
        const aDate = new Date(a.date);
        return aDate >= dayStart && aDate <= dayEnd;
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
        absent: totalEmployees - dayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
      });
    }

    // Department-wise attendance
    const departments = await User.distinct('department');
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptEmployees = await User.find({ department: dept, role: 'employee' });
        const deptEmployeeIds = deptEmployees.map((e) => e._id);
        const deptAttendance = todayAttendance.filter((a) =>
          deptEmployeeIds.includes(a.userId._id)
        );
        const deptPresent = deptAttendance.filter(
          (a) => a.status === 'present' || a.status === 'late'
        ).length;

        return {
          department: dept,
          total: deptEmployees.length,
          present: deptPresent,
          absent: deptEmployees.length - deptPresent,
        };
      })
    );

    res.json({
      totalEmployees,
      todayStats: {
        present: presentToday,
        absent: absentToday,
        late: lateToday,
      },
      absentEmployeesToday: absentEmployees,
      weeklyTrend,
      departmentStats,
    });
  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

