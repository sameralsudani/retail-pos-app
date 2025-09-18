const Category = require('../models/Category');

const categories = [
  {
    name: 'Beverages',
    description: 'Hot and cold drinks, coffee, tea, juices, and soft drinks',
    color: '#3B82F6'
  },
  {
    name: 'Bakery',
    description: 'Fresh bread, pastries, cakes, and baked goods',
    color: '#F59E0B'
  },
  {
    name: 'Electronics',
    description: 'Phones, accessories, headphones, and electronic devices',
    color: '#8B5CF6'
  },
  {
    name: 'Produce',
    description: 'Fresh fruits, vegetables, and organic produce',
    color: '#10B981'
  },
  {
    name: 'Stationery',
    description: 'Office supplies, pens, notebooks, and paper products',
    color: '#EF4444'
  },
  {
    name: 'Clothing',
    description: 'Apparel, fashion items, and accessories',
    color: '#EC4899'
  },
  {
    name: 'Snacks',
    description: 'Chips, crackers, nuts, and quick snacks',
    color: '#F97316'
  },
  {
    name: 'Health & Beauty',
    description: 'Personal care, cosmetics, and health products',
    color: '#06B6D4'
  }
];

const seedCategories = async () => {
  try {
    console.log('🏷️  Seeding categories...');
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    
    console.log(`✅ Successfully seeded ${createdCategories.length} categories`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = { seedCategories, categories };