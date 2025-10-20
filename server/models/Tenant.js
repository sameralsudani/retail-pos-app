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
    language: { type: String, enum: ["en", "ar"], default: "en" },
    logo: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
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
    settings: {
      timezone: { type: String, default: "UTC" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tenant", tenantSchema);
