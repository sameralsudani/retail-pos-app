const Employee = require('../models/Employee');

const createEmployees = (tenants) => {
  const employeesForTenant1 = [
    // Demo Store 1 Employees
    {
      tenantId: tenants[0]._id,
      name: 'Sarah Miller',
      position: 'Store Manager',
      department: 'Management',
      email: 'sarah.miller@demo1.com',
      phone: '+1 (555) 123-4567',
      employeeId: 'EMP001',
      hourlyRate: 25.00,
      status: 'active',
      shift: '9:00 AM - 5:00 PM',
      hireDate: new Date('2023-03-15'),
      address: {
        street: '123 Manager St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'John Miller',
        phone: '+1 (555) 123-9999',
        relationship: 'Spouse'
      },
      hoursThisWeek: 40,
      performance: 95,
      notes: 'Excellent leadership skills, great with customer service'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Mike Rodriguez',
      position: 'Senior Cashier',
      department: 'Sales',
      email: 'mike.rodriguez@demo1.com',
      phone: '+1 (555) 234-5678',
      employeeId: 'EMP002',
      hourlyRate: 18.50,
      status: 'active',
      shift: '8:00 AM - 6:00 PM',
      hireDate: new Date('2023-07-22'),
      address: {
        street: '456 Sales Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Maria Rodriguez',
        phone: '+1 (555) 234-9999',
        relationship: 'Sister'
      },
      hoursThisWeek: 45,
      performance: 88,
      notes: 'Fast and accurate with transactions, popular with customers'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Alex Thompson',
      position: 'Stock Clerk',
      department: 'Inventory',
      email: 'alex.thompson@demo1.com',
      phone: '+1 (555) 345-6789',
      employeeId: 'EMP003',
      hourlyRate: 16.00,
      status: 'active',
      shift: '3:00 PM - 11:00 PM',
      hireDate: new Date('2024-01-10'),
      address: {
        street: '789 Inventory Rd',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Lisa Thompson',
        phone: '+1 (555) 345-9999',
        relationship: 'Mother'
      },
      hoursThisWeek: 38,
      performance: 92,
      notes: 'Very organized, excellent attention to detail'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Emily Davis',
      position: 'Pharmacist',
      department: 'Pharmacy',
      email: 'emily.davis@demo1.com',
      phone: '+1 (555) 456-7890',
      employeeId: 'EMP004',
      hourlyRate: 45.00,
      status: 'active',
      shift: '10:00 AM - 6:00 PM',
      hireDate: new Date('2022-11-05'),
      address: {
        street: '321 Pharmacy Blvd',
        city: 'New York',
        state: 'NY',
        zipCode: '10004',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Robert Davis',
        phone: '+1 (555) 456-9999',
        relationship: 'Husband'
      },
      hoursThisWeek: 40,
      performance: 98,
      notes: 'Licensed pharmacist, excellent patient care'
    },
    {
      tenantId: tenants[0]._id,
      name: 'James Wilson',
      position: 'Security Guard',
      department: 'Security',
      email: 'james.wilson@demo1.com',
      phone: '+1 (555) 567-8901',
      employeeId: 'EMP005',
      hourlyRate: 20.00,
      status: 'inactive',
      shift: '11:00 PM - 7:00 AM',
      hireDate: new Date('2023-09-12'),
      address: {
        street: '654 Security Way',
        city: 'New York',
        state: 'NY',
        zipCode: '10005',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Mary Wilson',
        phone: '+1 (555) 567-9999',
        relationship: 'Wife'
      },
      hoursThisWeek: 0,
      performance: 85,
      notes: 'Currently on leave, reliable security officer'
    },
    
    // Demo Store 2 Employees
    {
      tenantId: tenants[1]._id,
      name: 'David Brown',
      position: 'Store Manager',
      department: 'Management',
      email: 'david.brown@demo2.com',
      phone: '+1 (555) 654-3210',
      employeeId: 'MGR001',
      hourlyRate: 28.00,
      status: 'active',
      shift: '8:00 AM - 6:00 PM',
      hireDate: new Date('2023-01-20'),
      hoursThisWeek: 42,
      performance: 93
    },
    {
      tenantId: tenants[1]._id,
      name: 'Lisa Garcia',
      position: 'Cashier',
      department: 'Sales',
      email: 'lisa.garcia@demo2.com',
      phone: '+1 (555) 789-0123',
      employeeId: 'CSH001',
      hourlyRate: 17.00,
      status: 'active',
      shift: '9:00 AM - 5:00 PM',
      hireDate: new Date('2023-08-15'),
      hoursThisWeek: 40,
      performance: 87
    },
    
    // Demo Store 3 Employees (Arabic names)
    {
      tenantId: tenants[2]._id,
      name: 'أحمد محمد',
      position: 'مدير المتجر',
      department: 'Management',
      email: 'ahmed.mohammed@demo3.com',
      phone: '+966 11 123 4567',
      employeeId: 'ADM001',
      hourlyRate: 30.00,
      status: 'active',
      shift: '8:00 AM - 6:00 PM',
      hireDate: new Date('2022-12-01'),
      hoursThisWeek: 45,
      performance: 96
    },
    {
      tenantId: tenants[2]._id,
      name: 'فاطمة علي',
      position: 'كاشير',
      department: 'Sales',
      email: 'fatima.ali@demo3.com',
      phone: '+966 11 987 6543',
      employeeId: 'CSH002',
      hourlyRate: 18.00,
      status: 'active',
      shift: '9:00 AM - 5:00 PM',
      hireDate: new Date('2023-06-10'),
      hoursThisWeek: 40,
      performance: 91
    }
  ];

  return employeesForTenant1;
};

const seedEmployees = async (tenants) => {
  try {
    console.log('👥 Seeding employees...');
    
    // Clear existing employees
    await Employee.deleteMany({});
    
    // Create employees with tenant references
    const employees = createEmployees(tenants);
    
    // Insert new employees
    const createdEmployees = await Employee.insertMany(employees);
    
    console.log(`✅ Successfully seeded ${createdEmployees.length} employees`);
    return createdEmployees;
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
    throw error;
  }
};

module.exports = { seedEmployees, createEmployees };