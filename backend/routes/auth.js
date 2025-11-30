import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').trim().notEmpty().withMessage('Department is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, department, role } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Generate employee ID
      const lastUser = await User.findOne().sort({ employeeId: -1 });
      let employeeId = 'EMP001';
      if (lastUser && lastUser.employeeId) {
        const lastNum = parseInt(lastUser.employeeId.replace('EMP', ''));
        employeeId = `EMP${String(lastNum + 1).padStart(3, '0')}`;
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        department,
        role: role || 'employee',
        employeeId,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error('Register error:', error);
      // Don't send response if already sent
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: error.message || 'Server error' 
        });
      }
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists - need to select password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error('Login error:', error);
      // Don't send response if already sent
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: error.message || 'Server error' 
        });
      }
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
    } catch (error) {
      console.error('Get me error:', error);
      // Don't send response if already sent
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: error.message || 'Server error' 
        });
      }
    }
});

export default router;

