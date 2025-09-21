const Tenant = require('../models/Tenant');

// Extract tenant from request (subdomain, header, or query param)
const extractTenant = async (req, res, next) => {
  try {
    let tenantIdentifier = null;
    
    // Method 1: Extract from custom header (for development/testing)
    if (req.headers['x-tenant-id']) {
      tenantIdentifier = req.headers['x-tenant-id'];
      console.log('Tenant from header:', tenantIdentifier);
    }
    
    // Method 2: Extract from query parameter
    if (!tenantIdentifier && req.query.tenant) {
      tenantIdentifier = req.query.tenant;
      console.log('Tenant from query:', tenantIdentifier);
    }
    
    // Method 3: Extract from subdomain (for production)
    const host = req.get('host') || req.get('x-forwarded-host');
    if (!tenantIdentifier && host && !host.includes('localhost')) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        tenantIdentifier = subdomain;
        console.log('Tenant from subdomain:', tenantIdentifier);
      }
    }
    
    // Method 4: For localhost development, try to find any tenant if none specified
    if (!tenantIdentifier && host && host.includes('localhost')) {
      // For localhost, don't auto-select a tenant - let the user specify
      console.log('Localhost detected but no tenant specified');
      return res.status(400).json({
        success: false,
        message: 'Please specify your store. Add ?tenant=YOUR_TENANT_ID to the URL or contact support.'
      });
    }
    
    // Method 5: If no tenant found, return error
    if (!tenantIdentifier) {
      console.log('No tenant identifier found');
      return res.status(400).json({
        success: false,
        message: 'Store identification required'
      });
    }
    
    console.log('Tenant identifier extracted:', tenantIdentifier);
    
    if (tenantIdentifier) {
      // Find tenant by subdomain or ID
      let tenant;
      if (tenantIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        tenant = await Tenant.findOne({ _id: tenantIdentifier, isActive: true });
        console.log('Found tenant by ID:', tenant ? tenant.name : 'Not found');
      } else {
        // It's a subdomain
        tenant = await Tenant.findOne({ subdomain: tenantIdentifier, isActive: true });
        console.log('Found tenant by subdomain:', tenant ? tenant.name : 'Not found');
      }
      
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant._id;
        console.log('Tenant set:', tenant.name, tenant._id);
      } else {
        console.log('Tenant not found or inactive for identifier:', tenantIdentifier);
        return res.status(404).json({
          success: false,
          message: 'Store not found or inactive'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Require tenant for protected routes
const requireTenant = (req, res, next) => {
  if (!req.tenant || !req.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Store identification required'
    });
  }
  next();
};

// Validate user belongs to tenant
const validateUserTenant = (req, res, next) => {
  if (req.user && req.tenantId && req.user.tenantId.toString() !== req.tenantId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: User does not belong to this store'
    });
  }
  next();
};

module.exports = {
  extractTenant,
  requireTenant,
  validateUserTenant
};
      if (firstTenant) {
        tenantIdentifier = firstTenant._id.toString();
        console.log('Using first available tenant for localhost:', tenantIdentifier, firstTenant.name);
      }
    }
    
    console.log('Tenant identifier extracted:', tenantIdentifier);
    
    if (tenantIdentifier) {
      // Find tenant by subdomain or ID
      let tenant;
      if (tenantIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        tenant = await Tenant.findById(tenantIdentifier);
        console.log('Found tenant by ID:', tenant ? tenant.name : 'Not found');
      } else {
        // It's a subdomain
        tenant = await Tenant.findOne({ subdomain: tenantIdentifier, isActive: true });
        console.log('Found tenant by subdomain:', tenant ? tenant.name : 'Not found');
      }
      
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant._id;
        console.log('Tenant set:', tenant.name, tenant._id);
      } else {
        console.log('Tenant not found for identifier:', tenantIdentifier);
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Require tenant for protected routes
const requireTenant = (req, res, next) => {
  if (!req.tenant || !req.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Store identification required'
    });
  }
  next();
};

// Validate user belongs to tenant
const validateUserTenant = (req, res, next) => {
  if (req.user && req.tenantId && req.user.tenantId.toString() !== req.tenantId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: User does not belong to this store'
    });
  }
  next();
};

module.exports = {
  extractTenant,
  requireTenant,
  validateUserTenant
};