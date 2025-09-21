const Tenant = require("../models/Tenant");

// Extract tenant from request (subdomain, header, or query param)
const extractTenant = async (req, res, next) => {
  try {
    let tenantIdentifier = null;

    // Method 0: If user is authenticated, use their tenant ID
    if (req.user && req.user.tenantId) {
      tenantIdentifier = req.user.tenantId.toString();
    }

    // Method 1: Extract from custom header (for development/testing)
    if (!tenantIdentifier && req.headers["x-tenant-id"]) {
      tenantIdentifier = req.headers["x-tenant-id"];
    }

    // Method 2: Extract from query parameter
    if (!tenantIdentifier && req.query.tenant) {
      tenantIdentifier = req.query.tenant;
    }

    // Method 3: Extract from subdomain (for production)
    const host = req.get("host") || req.get("x-forwarded-host");
    if (!tenantIdentifier && host && !host.includes("localhost")) {
      const subdomain = host.split(".")[0];
      if (subdomain && subdomain !== "www" && subdomain !== "localhost") {
        tenantIdentifier = subdomain;
      }
    }

    // Method 4: For localhost development, try to find any tenant if none specified
    if (!tenantIdentifier && host && host.includes("localhost")) {
      // For localhost development, find the first available tenant
      console.log("Localhost detected, finding first available tenant...");
      const firstTenant = await Tenant.findOne({ isActive: true });
      if (firstTenant) {
        tenantIdentifier = firstTenant._id.toString();
      }
    }

    // Method 5: If no tenant found, return error
    if (!tenantIdentifier) {
      console.log("No tenant identifier found");
      return res.status(400).json({
        success: false,
        message: "Store identification required",
      });
    }

    if (tenantIdentifier) {
      // Find tenant by subdomain or ID
      let tenant;
      if (tenantIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        tenant = await Tenant.findOne({
          _id: tenantIdentifier,
          isActive: true,
        });
      } else {
        // It's a subdomain
        tenant = await Tenant.findOne({
          subdomain: tenantIdentifier,
          isActive: true,
        });
      }

      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant._id;
      } else {
        console.log(
          "Tenant not found or inactive for identifier:",
          tenantIdentifier
        );
        return res.status(404).json({
          success: false,
          message: "Store not found or inactive",
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Require tenant for protected routes
const requireTenant = (req, res, next) => {
  if (!req.tenant || !req.tenantId) {
    return res.status(400).json({
      success: false,
      message: "Store identification required",
    });
  }
  next();
};

// Validate user belongs to tenant
const validateUserTenant = (req, res, next) => {
  if (req.user && req.tenantId) {
    // Handle both ObjectId and populated object comparisons
    let userTenantId = null;
    if (req.user.tenantId) {
      // If tenantId is populated (object with _id), extract the _id
      if (typeof req.user.tenantId === "object" && req.user.tenantId._id) {
        userTenantId = req.user.tenantId._id.toString();
      } else {
        // If tenantId is just an ObjectId or string
        userTenantId = req.user.tenantId.toString();
      }
    }

    const requestTenantId = req.tenantId.toString();

    // Only validate if user has a tenantId
    if (userTenantId && requestTenantId && userTenantId !== requestTenantId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: User does not belong to this store",
      });
    }

    console.log("✅ Tenant validation passed");
  }

  next();
};

module.exports = {
  extractTenant,
  requireTenant,
  validateUserTenant,
};
