const User = require('../models/User');

const createUsers = (tenants) => {
  const usersForTenant1 = [
    // Demo Store 1 Users
    {
      tenantId: tenants[0]._id,
      name: 'John Doe',
      email: 'admin@demo1.com',
      password: 'admin123',
      role: 'admin',
      employeeId: 'EMP001',
      phone: '(555) 123-4567'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Jane Smith',
      email: 'cashier@demo1.com',
      password: 'cashier123',
      role: 'cashier',
      employeeId: 'EMP002',
      phone: '(555) 987-6543'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Mike Johnson',
      email: 'manager@demo1.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'EMP003',
      phone: '(555) 456-7890'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@demo1.com',
      password: 'sarah123',
      role: 'cashier',
      employeeId: 'EMP004',
      phone: '(555) 321-0987'
    },
    
    // Demo Store 2 Users
    {
      tenantId: tenants[1]._id,
      name: 'David Brown',
      email: 'admin@demo2.com',
      password: 'admin123',
      role: 'admin',
      employeeId: '456788',
      phone: '(555) 654-3210'
    },
    {
      tenantId: tenants[1]._id,
      name: 'Lisa Garcia',
      email: 'cashier@demo2.com',
      password: 'cashier123',
      role: 'cashier',
      employeeId: '34567',
      phone: '(555) 789-0123'
    },
    
    // Demo Store 3 Users (Arabic)
    {
      tenantId: tenants[2]._id,
      name: 'أحمد محمد',
      email: 'admin@demo3.com',
      password: 'admin123',
      role: 'admin',
      employeeId: '123456',
      phone: '+966 11 123 4567'
    },
    {
      tenantId: tenants[2]._id,
      name: 'فاطمة علي',
      email: 'cashier@demo3.com',
      password: 'cashier123',
      role: 'cashier',
      employeeId: '67823',
      phone: '+966 11 987 6543'
    }
  ];

  return usersForTenant1;
};

const seedUsers = async (tenants) => {
  try {
    console.log('👥 Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Validate tenants input
    if (!tenants || tenants.length === 0) {
      throw new Error('No tenants provided for user seeding');
    }
    
    console.log('Available tenants for user seeding:', tenants.map(t => ({ id: t._id, name: t.name })));
    
    // Create users with tenant references
    const users = createUsers(tenants);
    
    console.log('Users to be created:', users.length);
    console.log('Sample user data:', users[0]);
    
    // Insert new users
    const createdUsers = await User.insertMany(users);
    
    console.log(`✅ Successfully seeded ${createdUsers.length} users`);
    console.log('Created users:', createdUsers.map(u => ({ id: u._id, name: u.name, role: u.role, email: u.email })));
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedUsers, createUsers };