const express = require("express");
const { body, validationResult } = require("express-validator");
const Tenant = require("../models/Tenant");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { protect, authorize, generateToken } = require("../middleware/auth");

const router = express.Router();

// Generate unique transaction ID
const generateTransactionId = (tenantId) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  const tenantPrefix = tenantId.toString().slice(-4).toUpperCase();
  return `${tenantPrefix}-${timestamp}-${random}`;
};

// @desc    Register new tenant (store)
// @route   POST /api/tenants/register
// @access  Public
router.post(
  "/register",
  [
    body("storeName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Store name is required"),
    body("storeCapital")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Store capital is required"),
    body("currency")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Currency is required"),
    body("language")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Language is required"),
    body("ownerName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Owner name must be at least 2 characters"),
    body("ownerEmail")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("ownerPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").optional().trim(),
    body("address.street").optional().trim(),
    body("address.city").optional().trim(),
    body("address.state").optional().trim(),
    body("address.zipCode").optional().trim(),
    body("address.country").optional().trim(),
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

      const {
        storeName,
        storeCapital,
        currency,
        language,
        description,
        ownerName,
        ownerEmail,
        ownerPassword,
        phone,
        address,
      } = req.body;

      // Check if owner email is already used
      const existingUser = await User.findOne({ email: ownerEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      // Create tenant
      const tenant = await Tenant.create({
        name: storeName,
        capital: storeCapital,
        currency,
        language,
        description,
        address,
        contact: {
          phone,
          email: ownerEmail,
        },
      });

      // Create owner user (admin)
      const owner = await User.create({
        tenantId: tenant._id,
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword,
        role: "admin",
        employeeId: tenant._id.toString().slice(-6).toUpperCase(),
        phone,
      });

      // Create a transaction at opening a store to record the initial capital
      await Transaction.create({
        tenantId: tenant._id,
        transactionId: generateTransactionId(tenant._id),
        transactionType: "capital",
        paidAmount: storeCapital,
        total: storeCapital,
        description: "Initial business capital",
        cashier: owner._id,
        status: "completed",
        isPaid: true,
        customerName: "Business Capital",
      });

      // Generate token for immediate login
      const token = generateToken(owner._id);

      res.status(201).json({
        success: true,
        message: "Store registered successfully",
        data: {
          tenant: {
            id: tenant._id,
            name: tenant.name,
            description: tenant.description,
          },
          user: {
            _id: owner._id,
            id: owner._id,
            name: owner.name,
            email: owner.email,
            role: owner.role,
            employeeId: owner.employeeId,
            phone: owner.phone,
            isActive: owner.isActive,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt,
          },
          token,
        },
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

// @desc    Get tenant info
// @route   GET /api/tenants/info
// @access  Private
router.get("/info", protect, async (req, res) => {
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

    const tenant = await Tenant.findOne({
      _id: userTenantId,
      isActive: true,
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Update tenant settings
// @route   PUT /api/tenants/settings
// @access  Private (Admin only)
router.put(
  "/settings",
  protect,
  authorize("admin"),
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Store name cannot be empty"),
    body("description").optional().trim(),
    body("contact.phone").optional().trim(),
    body("contact.email")
      .optional()
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("settings.currency")
      .optional()
      .isIn(["USD", "EUR", "GBP", "SAR", "AED"])
      .withMessage("Invalid currency"),
    body("settings.language")
      .optional()
      .isIn(["en", "ar"])
      .withMessage("Invalid language"),
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

      const tenant = await Tenant.findOne({
        _id: userTenantId,
        isActive: true,
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const updatedTenant = await Tenant.findByIdAndUpdate(
        userTenantId,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Store settings updated successfully",
        data: updatedTenant,
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
