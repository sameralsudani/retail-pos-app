const Supplier = require('../models/Supplier');
const Tenant = require('../models/Tenant');

const createSuppliers = (tenants) => {
  const suppliersForTenant1 = [
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Fresh Foods Co.',
    contactPerson: 'John Smith',
    email: 'john@freshfoods.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Supply Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentTerms: 'Net 30'
  },
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Tech Solutions Ltd.',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@techsolutions.com',
    phone: '(555) 987-6543',
    address: {
      street: '456 Technology Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    paymentTerms: 'Net 15'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Global Beverages Inc.',
    contactPerson: 'Mike Davis',
    email: 'mike@globalbev.com',
    phone: '(555) 456-7890',
    address: {
      street: '789 Beverage Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    paymentTerms: 'Net 45'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Office Supplies Pro',
    contactPerson: 'Lisa Wilson',
    email: 'lisa@officesupplies.com',
    phone: '(555) 321-0987',
    address: {
      street: '321 Office Park',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'USA'
    },
    paymentTerms: 'Net 30'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Fashion Forward',
    contactPerson: 'Emma Brown',
    email: 'emma@fashionforward.com',
    phone: '(555) 654-3210',
    address: {
      street: '654 Fashion District',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    paymentTerms: 'Net 60'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Healthy Living Distributors',
    contactPerson: 'David Chen',
    email: 'david@healthyliving.com',
    phone: '(555) 789-0123',
    address: {
      street: '789 Wellness Way',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    paymentTerms: 'Net 30'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Snack Attack Wholesale',
    contactPerson: 'Maria Rodriguez',
    email: 'maria@snackattack.com',
    phone: '(555) 234-5678',
    address: {
      street: '234 Snack Street',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    paymentTerms: 'Net 15'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Organic Farms Direct',
    contactPerson: 'Robert Green',
    email: 'robert@organicfarms.com',
    phone: '(555) 345-6789',
    address: {
      street: '345 Farm Road',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA'
    },
    paymentTerms: 'Net 30'
  }
];

  return suppliersForTenant1;
};

const seedSuppliers = async () => {
  try {
    console.log('🚚 Seeding suppliers...');
    
    // Clear existing suppliers
    await Supplier.deleteMany({});
    
    // Get tenants
    const tenants = await Tenant.find({});
    const suppliers = createSuppliers(tenants);
    
    // Insert new suppliers
    const createdSuppliers = await Supplier.insertMany(suppliers);
    
    console.log(`✅ Successfully seeded ${createdSuppliers.length} suppliers`);
    return createdSuppliers;
  } catch (error) {
    console.error('❌ Error seeding suppliers:', error);
    throw error;
  }
};

module.exports = { seedSuppliers, createSuppliers };