const express = require('express');
const { body, validationResult, query } = require('express-validator');
const fs = require('fs').promises;
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../config/cloudinary');

const router = express.Router();
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('inStock').optional().isBoolean().withMessage('inStock must be boolean')
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

    let query = { isActive: true, tenantId: userTenantId };

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (req.query.inStock === 'false') {
      query.stock = { $lte: 0 };
    }

    const products = await Product.find(query)
      .populate('category', 'name color')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
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

    const product = await Product.findOne({ 
      _id: req.params.id, 
      tenantId: userTenantId 
    })
      .populate('category', 'name color')
      .populate('supplier', 'name contactPerson');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Manager)
router.post('/', protect, authorize('admin', 'manager'), upload.single('image'), handleUploadError, [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('sku').trim().isLength({ min: 1 }).withMessage('SKU is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('reorderLevel').optional().isInt({ min: 0 }).withMessage('Reorder level must be non-negative')
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

    // Check if SKU already exists
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

    const existingProduct = await Product.findOne({ 
      sku: req.body.sku.toUpperCase(),
      tenantId: userTenantId
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    let imageUrl = 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300';
    
    // Handle image upload if file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file);
        
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          console.error('Image upload failed:', uploadResult.error);
          // Continue with default image if upload fails
        }
        
        // Clean up temporary file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      } catch (error) {
        console.error('Error processing image upload:', error);
        // Continue with default image if upload fails
      }
    }

    const product = await Product.create({
      ...req.body,
      tenantId: userTenantId,
      sku: req.body.sku.toUpperCase(),
      image: imageUrl
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name color')
      .populate('supplier', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Manager)
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('image'), handleUploadError, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
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

    let product = await Product.findOne({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If updating SKU, check for duplicates
    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ 
        sku: req.body.sku.toUpperCase(),
        tenantId: req.user.tenantId
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
      req.body.sku = req.body.sku.toUpperCase();
    }

    // Handle image upload if file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file);
        
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

    product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name color').populate('supplier', 'name');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - set isActive to false
    await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get product by SKU/Barcode
// @route   GET /api/products/barcode/:code
// @access  Private
router.get('/barcode/:code', protect, async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { sku: req.params.code.toUpperCase() },
        { barcode: req.params.code }
      ],
      tenantId: req.user.tenantId,
      isActive: true
    }).populate('category', 'name color');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
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