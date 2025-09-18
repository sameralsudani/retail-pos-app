const mongoose = require('mongoose');
const { seedCategories } = require('./categories');
const { seedSuppliers } = require('./suppliers');
const { seedUsers } = require('./users');
const { seedCustomers } = require('./customers');
const { seedProducts } = require('./products');
const { seedTransactions } = require('./transactions');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_pos');
    console.log('✅ Connected to MongoDB');

    // Seed in order (due to dependencies)
    console.log('\n📊 Seeding database with sample data...\n');
    
    // 1. Seed categories first (no dependencies)
    const categories = await seedCategories();
    
    // 2. Seed suppliers (no dependencies)
    const suppliers = await seedSuppliers();
    
    // 3. Seed users (no dependencies)
    const users = await seedUsers();
    
    // 4. Seed customers (no dependencies)
    const customers = await seedCustomers();
    
    // 5. Seed products (depends on categories and suppliers)
    const products = await seedProducts(categories, suppliers);
    
    // 6. Seed transactions (depends on users, customers, and products)
    const transactions = await seedTransactions(users, customers, products);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Suppliers: ${suppliers.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Admin: admin@retailpos.com / admin123');
    console.log('   Manager: manager@retailpos.com / manager123');
    console.log('   Cashier: cashier@retailpos.com / cashier123');
    
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