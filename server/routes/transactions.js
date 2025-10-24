const express = require("express");
const mongoose = require("mongoose");
const { validationResult, query } = require("express-validator");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const Tenant = require("../models/Tenant");

const router = express.Router();

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
router.get(
  "/",
  protect,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid start date format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid end date format"),
    query("cashier").optional().isMongoId().withMessage("Invalid cashier ID"),
    query("customer").optional().isMongoId().withMessage("Invalid customer ID"),
    query("transactionType")
      .optional()
      .isIn(["sale", "debit", "capital"])
      .withMessage("Transaction type must be sale, debit, or capital"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Extract tenantId from user (handle both populated and non-populated)
      let userTenantId;
      if (typeof req.user.tenantId === "object" && req.user.tenantId._id) {
        userTenantId = req.user.tenantId._id;
      } else {
        userTenantId = req.user.tenantId;
      }

      if (!userTenantId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with any store",
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query
      let query = { tenantId: userTenantId };

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

      // Transaction type filter
      if (req.query.transactionType) {
        query.transactionType = req.query.transactionType;
      }

      const transactions = await Transaction.find(query)
        .populate("customer", "name email")
        .populate("cashier", "name employeeId")
        .populate("items.product", "name sku")
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
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    // Extract tenantId from user (handle both populated and non-populated)
    let userTenantId;
    if (typeof req.user.tenantId === "object" && req.user.tenantId._id) {
      userTenantId = req.user.tenantId._id;
    } else {
      userTenantId = req.user.tenantId;
    }

    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with any store",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      tenantId: userTenantId,
    })
      .populate("customer", "name email phone")
      .populate("cashier", "name employeeId")
      .populate("items.product", "name sku category");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    // Extract tenantId from user (handle both populated and non-populated)
    let userTenantId;
    if (typeof req.user.tenantId === "object" && req.user.tenantId._id) {
      userTenantId = req.user.tenantId._id;
    } else {
      userTenantId = req.user.tenantId;
    }

    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with any store",
      });
    }

    const {
      items,
      customer,
      paymentMethod,
      paidAmount,
      isPaid = false,
      dueAmount = 0,
      transactionType,
    } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and must not be empty",
      });
    }

    if (
      !paymentMethod ||
      !["cash", "card", "digital"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid payment method is required (cash, card, or digital)",
      });
    }

    if (typeof paidAmount !== "number" || paidAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid must be a non-negative number",
      });
    }

    // Validate customer ID if provided
    if (customer && !mongoose.Types.ObjectId.isValid(customer)) {
      console.log("Invalid customer ID format:", customer);
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    // Validate and process items
    let total = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`,
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      const product = await Product.findOne({
        _id: item.product,
        tenantId: userTenantId,
      });

      if (!product) {
        console.log(`Product not found: ${item.product}`);
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      processedItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          sku: product.sku,
        },
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });

      // Update product stock
      await Product.findOneAndUpdate(
        { _id: product._id, tenantId: userTenantId },
        {
          $inc: { stock: -item.quantity },
        }
      );
    }

    // Create transaction
    const transaction = await Transaction.create({
      tenantId: userTenantId,
      transactionId: generateTransactionId(userTenantId),
      items: processedItems,
      customer: customer || undefined,
      cashier: req.user._id,
      total,
      paymentMethod,
      paidAmount,
      isPaid,
      dueAmount,
      status: isPaid ? "completed" : "due",
      transactionType: transactionType || "sale",
    });
    if (transactionType === "sale") {
      // add paidAmount to store capital
      await Tenant.findOneAndUpdate(
        { _id: userTenantId },
        {
          $inc: { capital: paidAmount },
        }
      );
    }

    // Populate transaction for response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("customer", "name email")
      .populate("cashier", "name employeeId")
      .populate("items.product", "name sku");

    res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      data: populatedTransaction,
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    // Extract tenantId from user (handle both populated and non-populated)
    let userTenantId;
    if (typeof req.user.tenantId === "object" && req.user.tenantId._id) {
      userTenantId = req.user.tenantId._id;
    } else {
      userTenantId = req.user.tenantId;
    }

    if (!userTenantId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with any store",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      tenantId: userTenantId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Only allow updating certain fields
    const allowedFields = [
      "status",
      "paidAmount",
      "paymentMethod",
      "notes",
      "dueAmount",
      "isPaid",
    ];
    allowedFields.forEach((field) => {
      if (field in req.body) {
        transaction[field] = req.body[field];
      }
    });

    // Optionally, recalculate dueAmount if paidAmount or total changed
    if ("paidAmount" in req.body) {
      transaction.dueAmount = transaction.total - transaction.paidAmount;
    }

    await transaction.save();

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
router.get(
  "/stats/summary",
  protect,
  [
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid start date format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid end date format"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Extract tenantId from user (handle both populated and non-populated)
      let userTenantId;
      if (typeof req.user.tenantId === "object" && req.user.tenantId._id) {
        userTenantId = req.user.tenantId._id;
      } else {
        userTenantId = req.user.tenantId;
      }

      if (!userTenantId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with any store",
        });
      }

      // Build date query
      let dateQuery = { tenantId: userTenantId };
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
            totalRevenue: { $sum: "$total" },
            averageTransaction: { $avg: "$total" },
            totalItemsSold: { $sum: { $sum: "$items.quantity" } },
          },
        },
      ]);

      // Calculate todaySales by aggregating for today's date
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const todayQuery = {
        tenantId: userTenantId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      };
      const todayStats = await Transaction.aggregate([
        { $match: todayQuery },
        {
          $group: {
            _id: null,
            todaySales: { $sum: "$total" },
          },
        },
      ]);

      const result = stats[0] || {
        totalTransactions: 0,
        totalRevenue: 0,
        averageTransaction: 0,
        totalItemsSold: 0,
      };

      result.todaySales = todayStats[0]?.todaySales || 0;

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;
