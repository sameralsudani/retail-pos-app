const Tenant = require("../models/Tenant");

// This middleware is no longer needed since we use authentication-based tenant isolation
// All tenant identification is handled through the authenticated user's tenantId

module.exports = {
  // Keeping module structure for potential future use
};
