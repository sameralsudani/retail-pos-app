const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Client = require('../models/Client');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
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
    let query = { tenantId: userTenantId };

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      count: clients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single client
// @route   GET /api/clients/:id
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

    const client = await Client.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
router.post('/', protect, [
  body('name').trim().isLength({ min: 1 }).withMessage('Client name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('notes').optional().trim()
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

    // Check if client already exists
    const existingClient = await Client.findOne({ 
      email: req.body.email,
      tenantId: userTenantId
    });
    
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    const client = await Client.create({
      ...req.body,
      tenantId: userTenantId
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
router.put('/:id', protect, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Client name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('notes').optional().trim(),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
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

    let client = await Client.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check for duplicate email if updating email
    if (req.body.email && req.body.email !== client.email) {
      const existingClient = await Client.findOne({ 
        email: req.body.email,
        tenantId: userTenantId
      });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Client with this email already exists'
        });
      }
    }

    client = await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: userTenantId },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
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

    const client = await Client.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Soft delete - set status to inactive
    await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: userTenantId },
      { status: 'inactive' }
    );

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get client statistics
// @route   GET /api/clients/stats/summary
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

    const stats = await Client.aggregate([
      { $match: { tenantId: userTenantId } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$totalRevenue' },
          totalActiveInvoices: { $sum: '$activeInvoices' },
          totalProjects: { $sum: '$projects' }
        }
      }
    ]);

    const result = stats[0] || {
      totalClients: 0,
      activeClients: 0,
      totalRevenue: 0,
      totalActiveInvoices: 0,
      totalProjects: 0
    };

    res.json({
      success: true,
      data: result
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