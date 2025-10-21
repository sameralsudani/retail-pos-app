const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // Business Capital
    capital: {
      type: Number,
      default: 0,
      min: [0, "Capital cannot be negative"],
    },
    currency: {
      type: String,
      enum: ["USD", "IQD"],
      default: "USD",
    },
    exchangeRate: { type: Number, default: 1 },
    language: { type: String, enum: ["en", "ar"], default: "en" },
    address: {
      type: String,
      default: "123 Main Street, City, State 12345",
      trim: true,
      maxlength: [200, "Store address cannot exceed 200 characters"],
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["basic", "premium", "enterprise"],
        default: "basic",
      },
      status: {
        type: String,
        enum: ["active", "suspended", "cancelled"],
        default: "active",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      limits: {
        users: { type: Number, default: 5 },
        products: { type: Number, default: 100 },
        transactions: { type: Number, default: 1000 },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Low stock threshold cannot be negative"],
    },

    // Notification Settings
    lowStockAlerts: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tenant", tenantSchema);
