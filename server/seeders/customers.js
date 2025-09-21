const Customer = require('../models/Customer');

const createCustomers = (tenants) => {
  const customersForTenant1 = [
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '(555) 111-2222',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    loyaltyPoints: 450,
    totalSpent: 1250.75,
    lastVisit: new Date('2024-01-15'),
    notes: 'Frequent customer, prefers organic products'
  },
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Bob Smith',
    email: 'bob.smith@email.com',
    phone: '(555) 333-4444',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    loyaltyPoints: 230,
    totalSpent: 680.50,
    lastVisit: new Date('2024-01-14'),
    notes: 'Likes electronics and gadgets'
  },
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Carol Davis',
    email: 'carol.davis@email.com',
    phone: '(555) 555-6666',
    address: {
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    loyaltyPoints: 680,
    totalSpent: 2150.25,
    lastVisit: new Date('2024-01-13'),
    notes: 'VIP customer, bulk buyer'
  },
  {
    tenantId: tenants[1]._id, // Demo Store 2
    name: 'Daniel Wilson',
    email: 'daniel.wilson@email.com',
    phone: '(555) 777-8888',
    address: {
      street: '321 Elm Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    loyaltyPoints: 125,
    totalSpent: 345.80,
    lastVisit: new Date('2024-01-12'),
    notes: 'New customer, interested in beverages'
  },
  {
    tenantId: tenants[1]._id, // Demo Store 2
    name: 'Eva Martinez',
    email: 'eva.martinez@email.com',
    phone: '(555) 999-0000',
    address: {
      street: '654 Maple Lane',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    loyaltyPoints: 890,
    totalSpent: 3250.90,
    lastVisit: new Date('2024-01-11'),
    notes: 'Regular customer, fashion enthusiast'
  },
  {
    tenantId: tenants[2]._id, // Demo Store 3
    name: 'Frank Thompson',
    email: 'frank.thompson@email.com',
    phone: '(555) 123-9876',
    address: {
      street: '987 Cedar Court',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA'
    },
    loyaltyPoints: 340,
    totalSpent: 890.45,
    lastVisit: new Date('2024-01-10'),
    notes: 'Office manager, buys stationery in bulk'
  },
  {
    tenantId: tenants[2]._id,
    name: 'Grace Lee',
    email: 'grace.lee@email.com',
    phone: '(555) 456-1234',
    address: {
      street: '147 Birch Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    loyaltyPoints: 520,
    totalSpent: 1450.30,
    lastVisit: new Date('2024-01-09'),
    notes: 'Health-conscious, prefers organic and natural products'
  },
  {
    tenantId: tenants[2]._id,
    name: 'Henry Clark',
    email: 'henry.clark@email.com',
    phone: '(555) 789-4567',
    address: {
      street: '258 Spruce Avenue',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30301',
      country: 'USA'
    },
    loyaltyPoints: 180,
    totalSpent: 520.75,
    lastVisit: new Date('2024-01-08'),
    notes: 'Tech enthusiast, frequent electronics buyer'
  },
  {
    tenantId: tenants[2]._id,
    name: 'Isabella Rodriguez',
    email: 'isabella.rodriguez@email.com',
    phone: '(555) 234-7890',
    address: {
      street: '369 Willow Way',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    loyaltyPoints: 750,
    totalSpent: 2100.60,
    lastVisit: new Date('2024-01-07'),
    notes: 'Fashion blogger, loves new clothing arrivals'
  },
  {
    tenantId: tenants[2]._id,
    name: 'Jack Miller',
    email: 'jack.miller@email.com',
    phone: '(555) 567-8901',
    address: {
      street: '741 Poplar Place',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA'
    },
    loyaltyPoints: 95,
    totalSpent: 280.40,
    lastVisit: new Date('2024-01-06'),
    notes: 'Coffee lover, visits daily for beverages'
  }
];

  return customersForTenant1;
};

const seedCustomers = async (tenants) => {
  try {
    console.log('👥 Seeding customers...');
    
    // Clear existing customers
    await Customer.deleteMany({});
    
    // Get tenants
    const tenants = await Tenant.find({});
    
    // Create customers with tenant references
    const customers = createCustomers(tenants);
    
    // Insert new customers
    const createdCustomers = await Customer.insertMany(customers);
    
    console.log(`✅ Successfully seeded ${createdCustomers.length} customers`);
    return createdCustomers;
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  }
};

module.exports = { seedCustomers, createCustomers };