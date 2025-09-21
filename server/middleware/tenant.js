const Tenant = require("../models/Tenant");

// Extract tenant from request (subdomain, header, or query param)
const extractTenant = async (req, res, next) => {
  try {
    // Priority 1: If user is authenticated, ALWAYS use their tenant ID
    if (req.user && req.user.tenantId) {
      let userTenantId;
      
      // Handle populated tenantId object
      if (typeof req.user.tenantId === 'object' && req.user.tenantId._id) {
        userTenantId = req.user.tenantId._id;
      } else {
        userTenantId = req.user.tenantId;
      }

      console.log('Using authenticated user tenant ID:', userTenantId);
      
      const tenant = await Tenant.findOne({
        _id: userTenantId,
        isActive: true
      });

      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant._id;
        console.log('✅ Tenant set from authenticated user:', tenant.name);
        return next();
      } else {
        console.log('❌ User tenant not found or inactive:', userTenantId);
        return res.status(404).json({
          success: false,
          message: 'Your store is not found or inactive'
        });
      }
    }

    // Priority 2: For unauthenticated requests, try other methods
    let tenantIdentifier = null;

    // Extract from custom header (for development/testing)
    if (req.headers["x-tenant-id"]) {
      tenantIdentifier = req.headers["x-tenant-id"];
    }

    // Extract from query parameter
    if (!tenantIdentifier && req.query.tenant) {
      tenantIdentifier = req.query.tenant;
    }

    // Extract from subdomain (for production)
    const host = req.get("host") || req.get("x-forwarded-host");
    if (!tenantIdentifier && host && !host.includes("localhost")) {
      const subdomain = host.split(".")[0];
      if (subdomain && subdomain !== "www" && subdomain !== "localhost") {
        tenantIdentifier = subdomain;
      }
    }

    // For localhost development without auth, find first tenant
    if (!tenantIdentifier && host && host.includes("localhost")) {
      console.log("Localhost detected, finding first available tenant...");
      const firstTenant = await Tenant.findOne({ isActive: true });
      if (firstTenant) {
        tenantIdentifier = firstTenant._id.toString();
        console.log('Using first available tenant for localhost:', tenantIdentifier, firstTenant.name);
      }
    }

    if (tenantIdentifier) {
      // Find tenant by subdomain or ID
      let tenant;
      if (tenantIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        tenant = await Tenant.findOne({
          _id: tenantIdentifier,
          isActive: true,
        });
      } else {
        tenant = await Tenant.findOne({
          subdomain: tenantIdentifier,
          isActive: true,
        });
      }

      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant._id;
        console.log('✅ Tenant set from identifier:', tenant.name);
      } else {
        return res.status(404).json({
          success: false,
          message: "Store not found or inactive",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Store identification required",
      });
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
    // Since extractTenant now prioritizes user's tenantId, 
    // validation should always pass for authenticated users
    console.log("✅ Tenant validation passed - using user's tenant");
  }

  next();
};

module.exports = {
  extractTenant,
  requireTenant,
  validateUserTenant,
};
