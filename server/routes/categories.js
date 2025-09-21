const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../config/cloudinary');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
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

    const categories = await Category.find({ 
      isActive: true, 
      tenantId: userTenantId 
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
router.get('/:id', protect, async (req, res) => {
  try {
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

    const category = await Category.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
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
router.post('/', protect, authorize('admin'), upload.single('image'), handleUploadError, [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid hex color format')
], async (req, res) => {
  try {
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
      tenantId: userTenantId,
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
      tenantId: userTenantId
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
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Category name cannot be empty'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid hex color format')
], async (req, res) => {
  try {
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
      tenantId: userTenantId 
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
        tenantId: userTenantId,
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
      { _id: req.params.id, tenantId: userTenantId },
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
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
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

    const category = await Category.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
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
      tenantId: userTenantId,
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
      { _id: req.params.id, tenantId: userTenantId },
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