import express from 'express';
import User from '../models/User.js';
import { protect, managerOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/all
// @desc    Get all users (Manager only)
// @access  Private (Manager)
router.get('/all', protect, managerOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ employeeId: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/departments
// @desc    Get all departments (Manager only)
// @access  Private (Manager)
router.get('/departments', protect, managerOnly, async (req, res) => {
  try {
    const departments = await User.distinct('department');
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ department: dept, role: 'employee' });
        return { department: dept, employeeCount: count };
      })
    );
    res.json(departmentStats);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/employee/:id
// @desc    Get specific employee details (Manager only)
// @access  Private (Manager)
router.get('/employee/:id', protect, managerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

