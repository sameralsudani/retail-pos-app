const express = require('express');
const { body, validationResult } = require('express-validator');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const { extractTenant, requireTenant, validateUserTenant } = require('../middleware/tenant');

const router = express.Router();

// Apply tenant middleware to all routes
router.use(extractTenant);
router.use(requireTenant);

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private (Admin/Manager)
router.get('/', protect, validateUserTenant, authorize('admin', 'manager'), async (req, res) => {
  try {
    const settings = await Settings.getSettings(req.tenantId);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin only)
router.put('/', protect, validateUserTenant, authorize('admin'), [
  body('storeName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Store name must be between 1 and 100 characters'),
  body('storeAddress').optional().trim().isLength({ max: 200 }).withMessage('Store address cannot exceed 200 characters'),
  body('storePhone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('storeEmail').optional().isEmail().withMessage('Please enter a valid email'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('taxIncluded').optional().isBoolean().withMessage('Tax included must be boolean'),
  body('receiptHeader').optional().trim().isLength({ max: 200 }).withMessage('Receipt header cannot exceed 200 characters'),
  body('receiptFooter').optional().trim().isLength({ max: 200 }).withMessage('Receipt footer cannot exceed 200 characters'),
  body('printLogo').optional().isBoolean().withMessage('Print logo must be boolean'),
  body('autoprint').optional().isBoolean().withMessage('Auto print must be boolean'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'SAR', 'AED']).withMessage('Invalid currency'),
  body('dateFormat').optional().isIn(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).withMessage('Invalid date format'),
  body('timeFormat').optional().isIn(['12', '24']).withMessage('Invalid time format'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be non-negative'),
  body('lowStockAlerts').optional().isBoolean().withMessage('Low stock alerts must be boolean'),
  body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('soundEffects').optional().isBoolean().withMessage('Sound effects must be boolean'),
  body('sessionTimeout').optional().isInt({ min: 5, max: 480 }).withMessage('Session timeout must be between 5 and 480 minutes'),
  body('requirePasswordChange').optional().isBoolean().withMessage('Require password change must be boolean'),
  body('twoFactorAuth').optional().isBoolean().withMessage('Two factor auth must be boolean'),
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('compactMode').optional().isBoolean().withMessage('Compact mode must be boolean'),
  body('showProductImages').optional().isBoolean().withMessage('Show product images must be boolean')
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

    const settings = await Settings.getSettings(req.tenantId);
    
    // Update settings with provided data
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Reset settings to defaults
// @route   POST /api/settings/reset
// @access  Private (Admin only)
router.post('/reset', protect, validateUserTenant, authorize('admin'), async (req, res) => {
  try {
    // Delete existing settings and create new with defaults
    await Settings.deleteMany({ tenantId: req.tenantId });
    const settings = await Settings.create({ tenantId: req.tenantId });

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: settings
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