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
      trim: true,
      maxlength: [200, "Store address cannot exceed 200 characters"],
    },
    contact: {
      phone: String,
      email: String,
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
