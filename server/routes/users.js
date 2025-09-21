const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { extractTenant, requireTenant, validateUserTenant } = require('../middleware/tenant');

const router = express.Router();

// Apply auth middleware first, then tenant middleware
router.use(protect);
router.use(extractTenant);
router.use(requireTenant);
router.use(validateUserTenant);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager)
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true, tenantId: req.tenantId };

    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Manager)
router.get('/:id', protect, validateUserTenant, authorize('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
router.post('/', protect, validateUserTenant, authorize('admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeId').trim().isLength({ min: 1 }).withMessage('Employee ID is required'),
  body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, employeeId, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      tenantId: req.tenantId,
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    const user = await User.create({
      tenantId: req.tenantId,
      name,
      email,
      password,
      employeeId,
      role,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
router.put('/:id', protect, validateUserTenant, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let user = await User.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate email if updating email
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        tenantId: req.tenantId
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Don't allow updating password through this route
    delete req.body.password;

    user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, validateUserTenant, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete - set isActive to false
    await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/summary
// @access  Private (Admin/Manager)
router.get('/stats/summary', authorize('admin', 'manager'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { isActive: true, tenantId: req.tenantId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments({ 
      isActive: true, 
      tenantId: req.tenantId 
    });
    const activeUsers = await User.countDocuments({ 
      isActive: true, 
      tenantId: req.tenantId,
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    const roleStats = {};
    stats.forEach(stat => {
      roleStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        roleStats,
        adminCount: roleStats.admin || 0,
        managerCount: roleStats.manager || 0,
        cashierCount: roleStats.cashier || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;