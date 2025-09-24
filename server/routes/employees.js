const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('department').optional().isIn(['Management', 'Sales', 'Inventory', 'Pharmacy', 'Security', 'Customer Service']).withMessage('Invalid department'),
  query('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('Invalid status')
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

    // Extract tenantId from user
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

    // Build query
    let query = { isActive: true, tenantId: userTenantId };

    // Department filter
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      count: employees.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Extract tenantId from user
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

    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/Manager)
router.post('/', protect, authorize('admin', 'manager'), [
  body('name').trim().isLength({ min: 1 }).withMessage('Employee name is required'),
  body('position').trim().isLength({ min: 1 }).withMessage('Position is required'),
  body('department').isIn(['Management', 'Sales', 'Inventory', 'Pharmacy', 'Security', 'Customer Service']).withMessage('Invalid department'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
  body('employeeId').trim().isLength({ min: 1 }).withMessage('Employee ID is required'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('shift').trim().isLength({ min: 1 }).withMessage('Shift is required'),
  body('hireDate').optional().isISO8601().withMessage('Invalid hire date format')
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

    // Extract tenantId from user
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

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      tenantId: userTenantId,
      $or: [{ email: req.body.email }, { employeeId: req.body.employeeId }]
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or employee ID already exists'
      });
    }

    const employee = await Employee.create({
      ...req.body,
      tenantId: userTenantId
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/Manager)
router.put('/:id', protect, authorize('admin', 'manager'), [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Employee name cannot be empty'),
  body('position').optional().trim().isLength({ min: 1 }).withMessage('Position cannot be empty'),
  body('department').optional().isIn(['Management', 'Sales', 'Inventory', 'Pharmacy', 'Security', 'Customer Service']).withMessage('Invalid department'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().trim().isLength({ min: 1 }).withMessage('Phone number cannot be empty'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('shift').optional().trim().isLength({ min: 1 }).withMessage('Shift cannot be empty'),
  body('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('Invalid status'),
  body('hoursThisWeek').optional().isFloat({ min: 0 }).withMessage('Hours must be non-negative'),
  body('performance').optional().isFloat({ min: 0, max: 100 }).withMessage('Performance must be between 0 and 100')
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

    // Extract tenantId from user
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

    let employee = await Employee.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check for duplicate email if updating email
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: req.body.email,
        tenantId: userTenantId
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, tenantId: userTenantId },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Extract tenantId from user
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

    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Soft delete - set status to terminated
    await Employee.findOneAndUpdate(
      { _id: req.params.id, tenantId: userTenantId },
      { status: 'terminated', isActive: false }
    );

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get employee statistics
// @route   GET /api/employees/stats/summary
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    // Extract tenantId from user
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

    const stats = await Employee.aggregate([
      { $match: { tenantId: userTenantId, isActive: true } },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalPayroll: { 
            $sum: { $multiply: ['$hourlyRate', '$hoursThisWeek'] }
          },
          averagePerformance: { $avg: '$performance' },
          departmentStats: {
            $push: {
              department: '$department',
              count: 1
            }
          }
        }
      }
    ]);

    const departmentBreakdown = await Employee.aggregate([
      { $match: { tenantId: userTenantId, isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalHours: { $sum: '$hoursThisWeek' },
          avgPerformance: { $avg: '$performance' }
        }
      }
    ]);

    const result = stats[0] || {
      totalEmployees: 0,
      activeEmployees: 0,
      totalPayroll: 0,
      averagePerformance: 0
    };

    res.json({
      success: true,
      data: {
        ...result,
        departmentBreakdown
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