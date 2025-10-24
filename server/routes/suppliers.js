const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Supplier = require("../models/Supplier");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all suppliers
// @route   GET /api/suppliers
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
    query("search").optional().trim(),
  ],
  async (req, res) => {
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query
      let query = { isActive: true, tenantId: userTenantId };

      // Search functionality
      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }

      const suppliers = await Supplier.find(query)
        .populate("productCount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Supplier.countDocuments(query);

      res.json({
        success: true,
        count: suppliers.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: suppliers,
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

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
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

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      tenantId: userTenantId,
    }).populate("productCount");

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (Admin)
router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Supplier name is required"),
    body("contactPerson")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Contact person is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("phone")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone number is required"),
    body("address")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Address is required"),
  ],
  async (req, res) => {
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Check if supplier already exists
      const existingSupplier = await Supplier.findOne({
        email: req.body.email,
        tenantId: userTenantId,
      });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: "Supplier with this email already exists",
        });
      }

      const supplier = await Supplier.create({
        ...req.body,
        tenantId: userTenantId,
      });

      res.status(201).json({
        success: true,
        message: "Supplier created successfully",
        data: supplier,
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

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Supplier name cannot be empty"),
    body("contactPerson")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Contact person cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("phone")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone number cannot be empty"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Address cannot be empty"),
  ],
  async (req, res) => {
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      let supplier = await Supplier.findOne({
        _id: req.params.id,
        tenantId: userTenantId,
      });

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      // Check for duplicate email if updating email
      if (req.body.email && req.body.email !== supplier.email) {
        const existingSupplier = await Supplier.findOne({
          email: req.body.email,
          tenantId: userTenantId,
        });
        if (existingSupplier) {
          return res.status(400).json({
            success: false,
            message: "Supplier with this email already exists",
          });
        }
      }

      supplier = await Supplier.findOneAndUpdate(
        { _id: req.params.id, tenantId: userTenantId },
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Supplier updated successfully",
        data: supplier,
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

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
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

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      tenantId: userTenantId,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Check if supplier has products
    const Product = require("../models/Product");
    const productCount = await Product.countDocuments({
      supplier: req.params.id,
      tenantId: userTenantId,
      isActive: true,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. It has ${productCount} active products.`,
      });
    }

    // Hard delete - remove document from DB
    await Supplier.deleteOne({ _id: req.params.id, tenantId: userTenantId });

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
