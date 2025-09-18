const User = require('../models/User');

const users = [
  {
    name: 'John Doe',
    email: 'admin@retailpos.com',
    password: 'admin123',
    role: 'admin',
    employeeId: 'EMP001',
    phone: '(555) 123-4567'
  },
  {
    name: 'Jane Smith',
    email: 'cashier@retailpos.com',
    password: 'cashier123',
    role: 'cashier',
    employeeId: 'EMP002',
    phone: '(555) 987-6543'
  },
  {
    name: 'Mike Johnson',
    email: 'manager@retailpos.com',
    password: 'manager123',
    role: 'manager',
    employeeId: 'EMP003',
    phone: '(555) 456-7890'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@retailpos.com',
    password: 'sarah123',
    role: 'cashier',
    employeeId: 'EMP004',
    phone: '(555) 321-0987'
  },
  {
    name: 'David Brown',
    email: 'david.brown@retailpos.com',
    password: 'david123',
    role: 'manager',
    employeeId: 'EMP005',
    phone: '(555) 654-3210'
  },
  {
    name: 'Lisa Garcia',
    email: 'lisa.garcia@retailpos.com',
    password: 'lisa123',
    role: 'cashier',
    employeeId: 'EMP006',
    phone: '(555) 789-0123'
  },
  {
    name: 'Tom Anderson',
    email: 'tom.anderson@retailpos.com',
    password: 'tom123',
    role: 'cashier',
    employeeId: 'EMP007',
    phone: '(555) 234-5678'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@retailpos.com',
    password: 'emily123',
    role: 'manager',
    employeeId: 'EMP008',
    phone: '(555) 345-6789'
  }
];

const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Insert new users
    const createdUsers = await User.insertMany(users);
    
    console.log(`✅ Successfully seeded ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedUsers, users };