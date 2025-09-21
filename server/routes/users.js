const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all users
router.get('/', protect, authorize('admin', 'manager'), [
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

    console.log('=== USERS GET REQUEST ===');
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email, tenantId: req.user.tenantId } : 'No user');

    // Extract tenantId from user (handle both populated and non-populated)
    let userTenantId;
    if (typeof req.user.tenantId === 'object' && req.user.tenantId._id) {
      userTenantId = req.user.tenantId._id;
    } else {
      userTenantId = req.user.tenantId;
    }
    
    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any store'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query using user's tenantId
    let query = { isActive: true, tenantId: userTenantId };

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

    console.log('Query:', query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    console.log('Found users:', users.length);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Users GET error:', error);
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
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const userTenantId = req.user.tenantId;
    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any store'
      });
    }

    const user = await User.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
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
router.post('/', protect, authorize('admin'), [
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

    const userTenantId = req.user.tenantId;
    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any store'
      });
    }

    const { name, email, password, employeeId, role, phone } = req.body;

    // Check if user already exists in this tenant
    const existingUser = await User.findOne({
      tenantId: userTenantId,
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    const user = await User.create({
      tenantId: userTenantId,
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
router.put('/:id', protect, authorize('admin'), [
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

    const userTenantId = req.user.tenantId;
    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any store'
      });
    }

    let user = await User.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
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
        tenantId: userTenantId
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
      { _id: req.params.id, tenantId: userTenantId },
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
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const userTenantId = req.user.tenantId;
    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any store'
      });
    }

    const user = await User.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
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
      { _id: req.params.id, tenantId: userTenantId },
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
router.get('/stats/summary', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const userTenantId = req.user.tenantId;
    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any store'
      });
    }

    const stats = await User.aggregate([
      { $match: { isActive: true, tenantId: userTenantId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments({ 
      isActive: true, 
      tenantId: userTenantId 
    });
    const activeUsers = await User.countDocuments({ 
      isActive: true, 
      tenantId: userTenantId,
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