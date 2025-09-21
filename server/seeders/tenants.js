const Tenant = require('../models/Tenant');

const tenants = [
  {
    name: 'Demo Store 1',
    subdomain: 'demo1',
    description: 'Premium electronics and lifestyle store',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'info@demo1.retailpos.com',
      website: 'https://demo1.retailpos.com'
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      limits: {
        users: 20,
        products: 1000,
        transactions: 10000
      }
    },
    settings: {
      currency: 'USD',
      timezone: 'America/New_York',
      language: 'en',
      taxRate: 8.5
    }
  },
  {
    name: 'Demo Store 2',
    subdomain: 'demo2',
    description: 'Fresh food and grocery store',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    contact: {
      phone: '(555) 987-6543',
      email: 'info@demo2.retailpos.com',
      website: 'https://demo2.retailpos.com'
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      limits: {
        users: 5,
        products: 100,
        transactions: 1000
      }
    },
    settings: {
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      language: 'en',
      taxRate: 7.25
    }
  },
  {
    name: 'متجر تجريبي 3',
    subdomain: 'demo3',
    description: 'متجر شامل للمنتجات المتنوعة',
    address: {
      street: '789 King Fahd Road',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '11564',
      country: 'Saudi Arabia'
    },
    contact: {
      phone: '+966 11 123 4567',
      email: 'info@demo3.retailpos.com',
      website: 'https://demo3.retailpos.com'
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      limits: {
        users: 50,
        products: 5000,
        transactions: 50000
      }
    },
    settings: {
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      language: 'ar',
      taxRate: 15.0
    }
  }
];

const seedTenants = async () => {
  try {
    console.log('🏢 Seeding tenants...');
    
    // Clear existing tenants
    await Tenant.deleteMany({});
    
    // Insert new tenants
    const createdTenants = await Tenant.insertMany(tenants);
    
    console.log(`✅ Successfully seeded ${createdTenants.length} tenants`);
    return createdTenants;
  } catch (error) {
    console.error('❌ Error seeding tenants:', error);
    throw error;
  }
};

module.exports = { seedTenants, tenants };