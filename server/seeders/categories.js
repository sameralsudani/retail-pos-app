const Category = require('../models/Category');

const createCategories = (tenants) => {
  const categoriesForTenant1 = [
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Beverages',
    description: 'Hot and cold drinks, coffee, tea, juices, and soft drinks',
    color: '#3B82F6'
  },
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Bakery',
    description: 'Fresh bread, pastries, cakes, and baked goods',
    color: '#F59E0B'
  },
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Electronics',
    description: 'Phones, accessories, headphones, and electronic devices',
    color: '#8B5CF6'
  },
  {
    tenantId: tenants[0]._id, // Demo Store 1
    name: 'Produce',
    description: 'Fresh fruits, vegetables, and organic produce',
    color: '#10B981'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Stationery',
    description: 'Office supplies, pens, notebooks, and paper products',
    color: '#EF4444'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Clothing',
    description: 'Apparel, fashion items, and accessories',
    color: '#EC4899'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Snacks',
    description: 'Chips, crackers, nuts, and quick snacks',
    color: '#F97316'
  },
  {
    tenantId: tenants[0]._id,
    name: 'Health & Beauty',
    description: 'Personal care, cosmetics, and health products',
    color: '#06B6D4'
  }
];

  return categoriesForTenant1;
};

const seedCategories = async (tenants) => {
  try {
    console.log('🏷️  Seeding categories...');
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Get tenants
    const categories = createCategories(tenants);
    
    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    
    console.log(`✅ Successfully seeded ${createdCategories.length} categories`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = { seedCategories, createCategories };