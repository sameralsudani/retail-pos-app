const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, [
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
    let query = {};

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
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
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
router.post('/', protect, [
  body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cash', 'card', 'digital']).withMessage('Invalid payment method'),
  body('amountPaid').isFloat({ min: 0 }).withMessage('Amount paid must be non-negative'),
  body('customer').optional().isMongoId().withMessage('Invalid customer ID')
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

    const { items, customer, paymentMethod, amountPaid, discount = 0 } = req.body;

    // Validate and process items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
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
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
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
      transactionId: generateTransactionId(),
      items: processedItems,
      customer,
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
      await Customer.findByIdAndUpdate(customer, {
        $inc: { 
          loyaltyPoints: loyaltyPointsEarned,
          totalSpent: total
        },
        lastVisit: new Date()
      });
    }

    // Populate transaction for response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer', 'name email')
      .populate('cashier', 'name employeeId')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      data: populatedTransaction
    });
  } catch (error) {
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
router.get('/stats/summary', protect, [
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
    let dateQuery = {};
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