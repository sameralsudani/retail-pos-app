const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { extractTenant, requireTenant, validateUserTenant } = require('../middleware/tenant');

const router = express.Router();

// Apply tenant middleware to all routes
router.use(extractTenant);
router.use(requireTenant);

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
router.get('/', protect, validateUserTenant, async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true, 
      tenantId: req.tenantId 
    })
      .populate('productCount')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id', protect, validateUserTenant, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    }).populate('productCount');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
router.post('/', protect, validateUserTenant, authorize('admin'), upload.single('image'), handleUploadError, [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid hex color format')
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

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      tenantId: req.tenantId,
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      ...req.body,
      tenantId: req.tenantId
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
router.put('/:id', protect, validateUserTenant, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Category name cannot be empty'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid hex color format')
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

    let category = await Category.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for duplicate name if updating name
    if (req.body.name && req.body.name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({ 
        tenantId: req.tenantId,
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Handle image upload if file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file, 'retail-pos/categories');
        
        if (uploadResult.success) {
          req.body.image = uploadResult.url;
          
          // TODO: Delete old image from Cloudinary if it exists
          // This would require storing the public_id in the database
        } else {
          console.error('Image upload failed:', uploadResult.error);
        }
        
        // Clean up temporary file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      } catch (error) {
        console.error('Error processing image upload:', error);
      }
    }

    category = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
router.delete('/:id', protect, validateUserTenant, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ 
      category: req.params.id, 
      tenantId: req.tenantId,
      isActive: true 
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} active products.`
      });
    }

    // Soft delete - set isActive to false
    await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Category deleted successfully'
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