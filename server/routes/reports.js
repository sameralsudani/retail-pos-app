const express = require('express');
const { query, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get overview report data
// @route   GET /api/reports/overview
// @access  Private (Admin/Manager)
router.get('/overview', protect, authorize('admin', 'manager'), [
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

    // Get key metrics
    const [salesStats, productStats, customerStats, userStats] = await Promise.all([
      // Sales statistics
      Transaction.aggregate([
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
      ]),
      
      // Product statistics
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            lowStockProducts: {
              $sum: {
                $cond: [{ $lte: ['$stock', '$reorderLevel'] }, 1, 0]
              }
            },
            outOfStockProducts: {
              $sum: {
                $cond: [{ $eq: ['$stock', 0] }, 1, 0]
              }
            },
            totalInventoryValue: {
              $sum: { $multiply: ['$price', '$stock'] }
            }
          }
        }
      ]),
      
      // Customer statistics
      Customer.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            totalLoyaltyPoints: { $sum: '$loyaltyPoints' },
            averageLoyaltyPoints: { $avg: '$loyaltyPoints' }
          }
        }
      ]),
      
      // User statistics
      User.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const sales = salesStats[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      totalTax: 0,
      averageTransaction: 0,
      totalItemsSold: 0
    };

    const products = productStats[0] || {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalInventoryValue: 0
    };

    const customers = customerStats[0] || {
      totalCustomers: 0,
      totalLoyaltyPoints: 0,
      averageLoyaltyPoints: 0
    };

    const roleStats = {};
    userStats.forEach(stat => {
      roleStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        sales,
        products,
        customers,
        users: {
          totalUsers: Object.values(roleStats).reduce((sum, count) => sum + count, 0),
          adminCount: roleStats.admin || 0,
          managerCount: roleStats.manager || 0,
          cashierCount: roleStats.cashier || 0
        }
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

// @desc    Get daily sales data
// @route   GET /api/reports/daily-sales
// @access  Private (Admin/Manager)
router.get('/daily-sales', protect, authorize('admin', 'manager'), [
  query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
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

    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailySales = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sales: { $sum: '$total' },
          transactions: { $sum: 1 },
          customers: { $addToSet: '$customer' }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          sales: 1,
          transactions: 1,
          customers: { $size: { $filter: { input: '$customers', cond: { $ne: ['$$this', null] } } } }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: dailySales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get top products report
// @route   GET /api/reports/top-products
// @access  Private (Admin/Manager)
router.get('/top-products', protect, authorize('admin', 'manager'), [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
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

    const limit = parseInt(req.query.limit) || 10;
    
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

    const topProducts = await Transaction.aggregate([
      { $match: dateQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productSnapshot.name' },
          sku: { $first: '$items.productSnapshot.sku' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          name: 1,
          sku: 1,
          quantity: 1,
          revenue: 1,
          category: { $arrayElemAt: ['$categoryInfo.name', 0] }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get category sales report
// @route   GET /api/reports/category-sales
// @access  Private (Admin/Manager)
router.get('/category-sales', protect, authorize('admin', 'manager'), [
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

    const categorySales = await Transaction.aggregate([
      { $match: dateQuery },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$categoryInfo._id', 0] },
          category: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } },
          sales: { $sum: '$items.totalPrice' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      {
        $group: {
          _id: null,
          categories: { $push: '$$ROOT' },
          totalSales: { $sum: '$sales' }
        }
      },
      {
        $project: {
          _id: 0,
          categories: {
            $map: {
              input: '$categories',
              as: 'cat',
              in: {
                category: '$$cat.category',
                sales: '$$cat.sales',
                quantity: '$$cat.quantity',
                percentage: {
                  $round: [
                    { $multiply: [{ $divide: ['$$cat.sales', '$totalSales'] }, 100] },
                    1
                  ]
                }
              }
            }
          }
        }
      }
    ]);

    const result = categorySales[0]?.categories || [];

    res.json({
      success: true,
      data: result.sort((a, b) => b.sales - a.sales)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get sales trends report
// @route   GET /api/reports/sales-trends
// @access  Private (Admin/Manager)
router.get('/sales-trends', protect, authorize('admin', 'manager'), [
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid period'),
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

    const period = req.query.period || 'daily';
    
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
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateQuery.createdAt = { $gte: thirtyDaysAgo };
    }

    let groupBy;
    switch (period) {
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // daily
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const trends = await Transaction.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: groupBy,
          sales: { $sum: '$total' },
          transactions: { $sum: 1 },
          customers: { $addToSet: '$customer' },
          averageTransaction: { $avg: '$total' }
        }
      },
      {
        $project: {
          _id: 0,
          period: '$_id',
          sales: 1,
          transactions: 1,
          customers: { $size: { $filter: { input: '$customers', cond: { $ne: ['$$this', null] } } } },
          averageTransaction: 1
        }
      },
      { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.week': 1 } }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private (Admin/Manager)
router.get('/inventory', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const [inventoryStats, lowStockProducts, categoryBreakdown] = await Promise.all([
      // Overall inventory statistics
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
            totalCostValue: { $sum: { $multiply: ['$costPrice', '$stock'] } },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$stock', '$reorderLevel'] }, 1, 0]
              }
            },
            outOfStockCount: {
              $sum: {
                $cond: [{ $eq: ['$stock', 0] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // Low stock products
      Product.find({
        isActive: true,
        $expr: { $lte: ['$stock', '$reorderLevel'] }
      })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ stock: 1 })
      .limit(20),
      
      // Category breakdown
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        {
          $group: {
            _id: '$category',
            category: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } },
            productCount: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        },
        { $sort: { totalValue: -1 } }
      ])
    ]);

    const stats = inventoryStats[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      totalCostValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };

    res.json({
      success: true,
      data: {
        stats,
        lowStockProducts,
        categoryBreakdown
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

// @desc    Get client report
// @route   GET /api/reports/clients
// @access  Private (Admin/Manager)
router.get('/clients', protect, authorize('admin', 'manager'), [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const limit = parseInt(req.query.limit) || 20;

    const [clientStats, topClients, loyaltyStats] = await Promise.all([
      // Client statistics
      Client.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalClients: { $sum: 1 },
            totalLoyaltyPoints: { $sum: '$loyaltyPoints' },
            totalSpent: { $sum: '$totalSpent' },
            averageSpent: { $avg: '$totalSpent' },
            averageLoyaltyPoints: { $avg: '$loyaltyPoints' }
          }
        }
      ]),
      
      // Top clients by spending
      Client.find({ isActive: true })
        .sort({ totalSpent: -1 })
        .limit(limit),
      
      // Loyalty points distribution
      Client.aggregate([
        { $match: { isActive: true } },
        {
          $bucket: {
            groupBy: '$loyaltyPoints',
            boundaries: [0, 100, 500, 1000, 5000],
            default: '5000+',
            output: {
              count: { $sum: 1 },
              totalSpent: { $sum: '$totalSpent' }
            }
          }
        }
      ])
    ]);

    const stats = clientStats[0] || {
      totalClients: 0,
      totalLoyaltyPoints: 0,
      totalSpent: 0,
      averageSpent: 0,
      averageLoyaltyPoints: 0
    };

    res.json({
      success: true,
      data: {
        stats,
        topClients,
        loyaltyDistribution: loyaltyStats
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