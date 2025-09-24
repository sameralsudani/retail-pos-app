const mongoose = require('mongoose');
const { seedTenants } = require('./tenants');
const { seedCategories } = require('./categories');
const { seedSuppliers } = require('./suppliers');
const { seedUsers } = require('./users');
const { seedCustomers } = require('./customers');
const { seedProducts } = require('./products');
const { seedClients } = require('./clients');
const { seedTransactions } = require('./transactions');
const { seedEmployees } = require('./employees');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_pos');
    console.log('✅ Connected to MongoDB');

    // Seed in order (due to dependencies)
    console.log('\n📊 Seeding database with sample data...\n');
    
    // 1. Seed tenants first (no dependencies)
    const tenants = await seedTenants();
    
    // 2. Seed users (depends on tenants)
    const users = await seedUsers(tenants);
    
    // 3. Seed categories (depends on tenants)
    const categories = await seedCategories(tenants);
    
    // 4. Seed suppliers (depends on tenants)
    const suppliers = await seedSuppliers(tenants);
    
    // 5. Seed customers (depends on tenants)
    const customers = await seedCustomers(tenants);
    
    // 6. Seed clients (depends on tenants)
    const clients = await seedClients(tenants);
    
    // 7. Seed employees (depends on tenants)
    const employees = await seedEmployees(tenants);
    
    // 7. Seed products (depends on tenants, categories and suppliers)
    const products = await seedProducts(tenants, categories, suppliers);
    
    // 8. Seed transactions (depends on tenants, users, customers, and products)
    const transactions = await seedTransactions(tenants, users, customers, products);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   Tenants: ${tenants.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Suppliers: ${suppliers.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Clients: ${clients.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('\n🏪 Demo Store 1 (demo1.retailpos.com):');
    console.log('   Admin: admin@demo1.com / admin123');
    console.log('   Manager: manager@demo1.com / manager123');
    console.log('   Cashier: cashier@demo1.com / cashier123');
    
    console.log('\n🏪 Demo Store 2 (demo2.retailpos.com):');
    console.log('   Admin: admin@demo2.com / admin123');
    console.log('   Cashier: cashier@demo2.com / cashier123');
    
    console.log('\n🏪 Demo Store 3 (demo3.retailpos.com - Arabic):');
    console.log('   Admin: admin@demo3.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };