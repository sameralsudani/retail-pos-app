const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
      unique: true,
    },
    // Store Information
    storeName: {
      type: String,
      default: "RetailPOS Store",
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    storeAddress: {
      type: String,
      default: "123 Main Street, City, State 12345",
      trim: true,
      maxlength: [200, "Store address cannot exceed 200 characters"],
    },
    storePhone: {
      type: String,
      default: "(555) 123-4567",
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    storeEmail: {
      type: String,
      default: "info@retailpos.com",
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    // Receipt Settings
    receiptHeader: {
      type: String,
      default: "Thank you for your business!",
      maxlength: [200, "Receipt header cannot exceed 200 characters"],
    },
    receiptFooter: {
      type: String,
      default: "Please keep this receipt for your records",
      maxlength: [200, "Receipt footer cannot exceed 200 characters"],
    },
    printLogo: {
      type: Boolean,
      default: true,
    },
    autoprint: {
      type: Boolean,
      default: false,
    },

    // System Settings

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
    dateFormat: {
      type: String,
      enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
      default: "MM/DD/YYYY",
    },
    timeFormat: {
      type: String,
      enum: ["12", "24"],
      default: "12",
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
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    soundEffects: {
      type: Boolean,
      default: true,
    },

    // Security Settings
    sessionTimeout: {
      type: Number,
      default: 30,
      min: [5, "Session timeout must be at least 5 minutes"],
      max: [480, "Session timeout cannot exceed 8 hours"],
    },
    requirePasswordChange: {
      type: Boolean,
      default: false,
    },
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },

    // Display Settings
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    showProductImages: {
      type: Boolean,
      default: true,
    },
    exchangeRate: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function (tenantId) {
  let settings = await this.findOne({ tenantId });
  if (!settings) {
    settings = await this.create({ tenantId });
  }
  return settings;
};

// Index for tenant-based queries
settingsSchema.index({ tenantId: 1 });

module.exports = mongoose.model("Settings", settingsSchema);
