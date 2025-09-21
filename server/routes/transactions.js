const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');
const { extractTenant, requireTenant, validateUserTenant } = require('../middleware/tenant');

const router = express.Router();

// Apply tenant middleware to all routes
router.use(extractTenant);
router.use(requireTenant);

// Generate unique transaction ID
const generateTransactionId = (tenantId) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  const tenantPrefix = tenantId.toString().slice(-4).toUpperCase();
  return `${tenantPrefix}-${timestamp}-${random}`;
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, validateUserTenant, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('cashier').optional().isMongoId().withMessage('Invalid cashier ID'),
  query('customer').optional().isMongoId().withMessage('Invalid customer ID')
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
    let query = { tenantId: req.tenantId };

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Cashier filter
    if (req.query.cashier) {
      query.cashier = req.query.cashier;
    }

    // Customer filter
    if (req.query.customer) {
      query.customer = req.query.customer;
    }

    const transactions = await Transaction.find(query)
      .populate('customer', 'name email')
      .populate('cashier', 'name employeeId')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', protect, validateUserTenant, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    })
      .populate('customer', 'name email phone')
      .populate('cashier', 'name employeeId')
      .populate('items.product', 'name sku category');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, validateUserTenant, async (req, res) => {
  try {
    console.log('=== TRANSACTION REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? { id: req.user._id, name: req.user.name } : 'No user');

    const { items, customer, paymentMethod, amountPaid, discount = 0 } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    if (!paymentMethod || !['cash', 'card', 'digital'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (cash, card, or digital)'
      });
    }

    if (typeof amountPaid !== 'number' || amountPaid < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount paid must be a non-negative number'
      });
    }

    // Validate customer ID if provided
    if (customer && !mongoose.Types.ObjectId.isValid(customer)) {
      console.log('Invalid customer ID format:', customer);
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID format'
      });
    }

    // Validate and process items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        console.log('Invalid product ID:', item.product);
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      const product = await Product.findOne({ 
        _id: item.product, 
        tenantId: req.tenantId 
      });
      
      if (!product) {
        console.log(`Product not found: ${item.product}`);
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        console.log(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          sku: product.sku
        },
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });

      // Update product stock
      await Product.findOneAndUpdate(
        { _id: product._id, tenantId: req.tenantId },
        {
        $inc: { stock: -item.quantity }
        }
      );
    }

    // Calculate totals
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax - discount;
    const change = amountPaid - total;

    if (change < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient payment amount'
      });
    }

    // Calculate loyalty points (1 point per dollar spent)
    const loyaltyPointsEarned = Math.floor(total);

    // Create transaction
    const transaction = await Transaction.create({
      tenantId: req.tenantId,
      transactionId: generateTransactionId(req.tenantId),
      items: processedItems,
      customer: customer || undefined,
      cashier: req.user._id,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      amountPaid,
      change,
      loyaltyPointsEarned
    });

    // Update customer loyalty points if customer exists
    if (customer) {
      await Customer.findOneAndUpdate(
        { _id: customer, tenantId: req.tenantId },
        {
        $inc: { 
          loyaltyPoints: loyaltyPointsEarned,
          totalSpent: total
        },
        lastVisit: new Date()
        }
      );
    }

    // Populate transaction for response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer', 'name email')
      .populate('cashier', 'name employeeId')
      .populate('items.product', 'name sku');

    console.log('=== TRANSACTION CREATED SUCCESSFULLY ===');
    console.log('Transaction ID:', populatedTransaction._id);
    console.log('=== TRANSACTION REQUEST END ===');
    
    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      data: populatedTransaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
router.get('/stats/summary', protect, validateUserTenant, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
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

    // Build date query
    let dateQuery = { tenantId: req.tenantId };
    if (req.query.startDate || req.query.endDate) {
      dateQuery.createdAt = {};
      if (req.query.startDate) {
        dateQuery.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        dateQuery.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const stats = await Transaction.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
          averageTransaction: { $avg: '$total' },
          totalItemsSold: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    const result = stats[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      totalTax: 0,
      averageTransaction: 0,
      totalItemsSold: 0
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