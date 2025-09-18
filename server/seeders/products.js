const Product = require('../models/Product');

const createProducts = (categories, suppliers) => {
  const beverageCategory = categories.find(c => c.name === 'Beverages')._id;
  const bakeryCategory = categories.find(c => c.name === 'Bakery')._id;
  const electronicsCategory = categories.find(c => c.name === 'Electronics')._id;
  const produceCategory = categories.find(c => c.name === 'Produce')._id;
  const stationeryCategory = categories.find(c => c.name === 'Stationery')._id;
  const clothingCategory = categories.find(c => c.name === 'Clothing')._id;
  const snacksCategory = categories.find(c => c.name === 'Snacks')._id;
  const healthCategory = categories.find(c => c.name === 'Health & Beauty')._id;

  const freshFoodsSupplier = suppliers.find(s => s.name === 'Fresh Foods Co.')._id;
  const techSupplier = suppliers.find(s => s.name === 'Tech Solutions Ltd.')._id;
  const beverageSupplier = suppliers.find(s => s.name === 'Global Beverages Inc.')._id;
  const officeSupplier = suppliers.find(s => s.name === 'Office Supplies Pro')._id;
  const fashionSupplier = suppliers.find(s => s.name === 'Fashion Forward')._id;
  const healthSupplier = suppliers.find(s => s.name === 'Healthy Living Distributors')._id;
  const snackSupplier = suppliers.find(s => s.name === 'Snack Attack Wholesale')._id;
  const organicSupplier = suppliers.find(s => s.name === 'Organic Farms Direct')._id;

  return [
    // Beverages
    {
      name: 'Premium Coffee Beans',
      description: 'Rich, aromatic coffee beans sourced from premium farms',
      price: 24.99,
      costPrice: 17.49,
      category: beverageCategory,
      sku: 'BEV001',
      barcode: '195026541849',
      stock: 45,
      reorderLevel: 10,
      supplier: beverageSupplier,
      image: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['premium', 'organic', 'fair-trade']
    },
    {
      name: 'Organic Green Tea',
      description: 'Pure organic green tea leaves with natural antioxidants',
      price: 12.99,
      costPrice: 9.09,
      category: beverageCategory,
      sku: 'BEV002',
      barcode: '195026541850',
      stock: 32,
      reorderLevel: 8,
      supplier: beverageSupplier,
      image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['organic', 'antioxidants', 'healthy']
    },
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice, 100% natural',
      price: 4.99,
      costPrice: 3.49,
      category: beverageCategory,
      sku: 'BEV003',
      barcode: '195026541851',
      stock: 28,
      reorderLevel: 12,
      supplier: organicSupplier,
      image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['fresh', 'natural', 'vitamin-c']
    },
    {
      name: 'Sparkling Water',
      description: 'Premium sparkling water with natural minerals',
      price: 2.49,
      costPrice: 1.74,
      category: beverageCategory,
      sku: 'BEV004',
      barcode: '195026541852',
      stock: 65,
      reorderLevel: 20,
      supplier: beverageSupplier,
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['sparkling', 'minerals', 'refreshing']
    },

    // Bakery
    {
      name: 'Artisan Bread',
      description: 'Freshly baked artisan bread with crispy crust',
      price: 6.50,
      costPrice: 4.55,
      category: bakeryCategory,
      sku: 'BAK001',
      barcode: '195026541853',
      stock: 18,
      reorderLevel: 5,
      supplier: freshFoodsSupplier,
      image: 'https://images.pexels.com/photos/209196/pexels-photo-209196.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['artisan', 'fresh', 'daily-baked']
    },
    {
      name: 'Fresh Croissants',
      description: 'Buttery, flaky croissants baked fresh daily',
      price: 3.75,
      costPrice: 2.63,
      category: bakeryCategory,
      sku: 'BAK002',
      barcode: '195026541854',
      stock: 24,
      reorderLevel: 8,
      supplier: freshFoodsSupplier,
      image: 'https://images.pexels.com/photos/2638026/pexels-photo-2638026.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['buttery', 'flaky', 'french']
    },
    {
      name: 'Chocolate Muffins',
      description: 'Rich chocolate muffins with chocolate chips',
      price: 4.25,
      costPrice: 2.98,
      category: bakeryCategory,
      sku: 'BAK003',
      barcode: '195026541855',
      stock: 16,
      reorderLevel: 6,
      supplier: freshFoodsSupplier,
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['chocolate', 'sweet', 'breakfast']
    },

    // Electronics
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 89.99,
      costPrice: 62.99,
      category: electronicsCategory,
      sku: 'ELE001',
      barcode: '195026541856',
      stock: 23,
      reorderLevel: 5,
      supplier: techSupplier,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['wireless', 'noise-cancellation', 'premium']
    },
    {
      name: 'Smartphone Case',
      description: 'Protective case for smartphones with premium materials',
      price: 29.99,
      costPrice: 20.99,
      category: electronicsCategory,
      sku: 'ELE002',
      barcode: '195026541857',
      stock: 67,
      reorderLevel: 15,
      supplier: techSupplier,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['protective', 'premium', 'durable']
    },
    {
      name: 'USB Charging Cable',
      description: 'Fast charging USB-C cable, 6 feet long',
      price: 15.99,
      costPrice: 11.19,
      category: electronicsCategory,
      sku: 'ELE003',
      barcode: '195026541858',
      stock: 45,
      reorderLevel: 12,
      supplier: techSupplier,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['fast-charging', 'usb-c', 'durable']
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with excellent sound quality',
      price: 59.99,
      costPrice: 41.99,
      category: electronicsCategory,
      sku: 'ELE004',
      barcode: '195026541859',
      stock: 19,
      reorderLevel: 8,
      supplier: techSupplier,
      image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['bluetooth', 'portable', 'wireless']
    },

    // Produce
    {
      name: 'Organic Apples',
      description: 'Fresh organic apples, crisp and sweet',
      price: 4.99,
      costPrice: 3.49,
      category: produceCategory,
      sku: 'PRO001',
      barcode: '195026541860',
      stock: 156,
      reorderLevel: 30,
      supplier: organicSupplier,
      image: 'https://images.pexels.com/photos/209439/pexels-photo-209439.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['organic', 'fresh', 'local']
    },
    {
      name: 'Fresh Bananas',
      description: 'Ripe yellow bananas, perfect for snacking',
      price: 2.99,
      costPrice: 2.09,
      category: produceCategory,
      sku: 'PRO002',
      barcode: '195026541861',
      stock: 89,
      reorderLevel: 25,
      supplier: organicSupplier,
      image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['fresh', 'potassium', 'healthy']
    },
    {
      name: 'Cherry Tomatoes',
      description: 'Sweet cherry tomatoes, perfect for salads',
      price: 3.99,
      costPrice: 2.79,
      category: produceCategory,
      sku: 'PRO003',
      barcode: '195026541862',
      stock: 42,
      reorderLevel: 15,
      supplier: organicSupplier,
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['cherry', 'sweet', 'salad']
    },
    {
      name: 'Fresh Spinach',
      description: 'Organic baby spinach leaves, nutrient-rich',
      price: 3.49,
      costPrice: 2.44,
      category: produceCategory,
      sku: 'PRO004',
      barcode: '195026541863',
      stock: 38,
      reorderLevel: 12,
      supplier: organicSupplier,
      image: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['organic', 'baby-spinach', 'iron']
    },

    // Stationery
    {
      name: 'Notebook Set',
      description: 'High-quality notebook set for writing and sketching',
      price: 15.99,
      costPrice: 11.19,
      category: stationeryCategory,
      sku: 'STA001',
      barcode: '195026541864',
      stock: 42,
      reorderLevel: 10,
      supplier: officeSupplier,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['writing', 'sketching', 'quality']
    },
    {
      name: 'Premium Pens',
      description: 'Smooth-writing premium ballpoint pens, pack of 5',
      price: 8.99,
      costPrice: 6.29,
      category: stationeryCategory,
      sku: 'STA002',
      barcode: '195026541865',
      stock: 78,
      reorderLevel: 20,
      supplier: officeSupplier,
      image: 'https://images.pexels.com/photos/159832/justice-law-case-hearing-159832.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['ballpoint', 'smooth', 'pack']
    },
    {
      name: 'Sticky Notes',
      description: 'Colorful sticky notes for reminders and organization',
      price: 5.99,
      costPrice: 4.19,
      category: stationeryCategory,
      sku: 'STA003',
      barcode: '195026541866',
      stock: 95,
      reorderLevel: 25,
      supplier: officeSupplier,
      image: 'https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['colorful', 'organization', 'reminders']
    },

    // Clothing
    {
      name: 'Designer T-Shirt',
      description: 'Comfortable cotton t-shirt with modern design',
      price: 34.99,
      costPrice: 24.49,
      category: clothingCategory,
      sku: 'CLO001',
      barcode: '195026541867',
      stock: 28,
      reorderLevel: 8,
      supplier: fashionSupplier,
      image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['cotton', 'comfortable', 'modern']
    },
    {
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans in premium quality',
      price: 79.99,
      costPrice: 55.99,
      category: clothingCategory,
      sku: 'CLO002',
      barcode: '195026541868',
      stock: 19,
      reorderLevel: 6,
      supplier: fashionSupplier,
      image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['denim', 'classic', 'premium']
    },
    {
      name: 'Cotton Hoodie',
      description: 'Warm and comfortable cotton hoodie',
      price: 49.99,
      costPrice: 34.99,
      category: clothingCategory,
      sku: 'CLO003',
      barcode: '195026541869',
      stock: 22,
      reorderLevel: 7,
      supplier: fashionSupplier,
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['cotton', 'warm', 'comfortable']
    },

    // Snacks
    {
      name: 'Mixed Nuts',
      description: 'Premium mixed nuts with almonds, cashews, and walnuts',
      price: 12.99,
      costPrice: 9.09,
      category: snacksCategory,
      sku: 'SNK001',
      barcode: '195026541870',
      stock: 54,
      reorderLevel: 15,
      supplier: snackSupplier,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['premium', 'protein', 'healthy']
    },
    {
      name: 'Potato Chips',
      description: 'Crispy potato chips with sea salt',
      price: 3.99,
      costPrice: 2.79,
      category: snacksCategory,
      sku: 'SNK002',
      barcode: '195026541871',
      stock: 87,
      reorderLevel: 25,
      supplier: snackSupplier,
      image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['crispy', 'sea-salt', 'snack']
    },
    {
      name: 'Granola Bars',
      description: 'Healthy granola bars with oats and honey',
      price: 8.99,
      costPrice: 6.29,
      category: snacksCategory,
      sku: 'SNK003',
      barcode: '195026541872',
      stock: 36,
      reorderLevel: 12,
      supplier: healthSupplier,
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['healthy', 'oats', 'honey']
    },

    // Health & Beauty
    {
      name: 'Hand Sanitizer',
      description: '70% alcohol hand sanitizer, 8 oz bottle',
      price: 6.99,
      costPrice: 4.89,
      category: healthCategory,
      sku: 'HLT001',
      barcode: '195026541873',
      stock: 125,
      reorderLevel: 30,
      supplier: healthSupplier,
      image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['sanitizer', 'antibacterial', 'protection']
    },
    {
      name: 'Face Masks',
      description: 'Disposable face masks, pack of 50',
      price: 19.99,
      costPrice: 13.99,
      category: healthCategory,
      sku: 'HLT002',
      barcode: '195026541874',
      stock: 48,
      reorderLevel: 12,
      supplier: healthSupplier,
      image: 'https://images.pexels.com/photos/4099355/pexels-photo-4099355.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['disposable', 'protection', 'pack']
    },
    {
      name: 'Vitamin C Tablets',
      description: 'Vitamin C supplement tablets, 60 count',
      price: 14.99,
      costPrice: 10.49,
      category: healthCategory,
      sku: 'HLT003',
      barcode: '195026541875',
      stock: 34,
      reorderLevel: 10,
      supplier: healthSupplier,
      image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['vitamin-c', 'supplement', 'immunity']
    },

    // Additional Products for variety
    {
      name: 'Energy Drink',
      description: 'Natural energy drink with vitamins and caffeine',
      price: 3.49,
      costPrice: 2.44,
      category: beverageCategory,
      sku: 'BEV005',
      barcode: '195026541876',
      stock: 72,
      reorderLevel: 20,
      supplier: beverageSupplier,
      image: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['energy', 'vitamins', 'caffeine']
    },
    {
      name: 'Bagels',
      description: 'Fresh everything bagels, pack of 6',
      price: 5.99,
      costPrice: 4.19,
      category: bakeryCategory,
      sku: 'BAK004',
      barcode: '195026541877',
      stock: 21,
      reorderLevel: 8,
      supplier: freshFoodsSupplier,
      image: 'https://images.pexels.com/photos/2434549/pexels-photo-2434549.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['everything', 'fresh', 'breakfast']
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 39.99,
      costPrice: 27.99,
      category: electronicsCategory,
      sku: 'ELE005',
      barcode: '195026541878',
      stock: 31,
      reorderLevel: 10,
      supplier: techSupplier,
      image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['wireless', 'ergonomic', 'precision']
    },
    {
      name: 'Avocados',
      description: 'Fresh ripe avocados, perfect for guacamole',
      price: 1.99,
      costPrice: 1.39,
      category: produceCategory,
      sku: 'PRO005',
      barcode: '195026541879',
      stock: 67,
      reorderLevel: 20,
      supplier: organicSupplier,
      image: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['fresh', 'ripe', 'healthy']
    },
    {
      name: 'Highlighter Set',
      description: 'Fluorescent highlighter markers, set of 4 colors',
      price: 7.99,
      costPrice: 5.59,
      category: stationeryCategory,
      sku: 'STA004',
      barcode: '195026541880',
      stock: 63,
      reorderLevel: 18,
      supplier: officeSupplier,
      image: 'https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['fluorescent', 'colors', 'office']
    },
    {
      name: 'Baseball Cap',
      description: 'Adjustable baseball cap with embroidered logo',
      price: 24.99,
      costPrice: 17.49,
      category: clothingCategory,
      sku: 'CLO004',
      barcode: '195026541881',
      stock: 35,
      reorderLevel: 10,
      supplier: fashionSupplier,
      image: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=300',
      tags: ['adjustable', 'embroidered', 'casual']
    }
  ];
};

const seedProducts = async (categories, suppliers) => {
  try {
    console.log('📦 Seeding products...');
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Create products with category and supplier references
    const products = createProducts(categories, suppliers);
    
    // Insert new products
    const createdProducts = await Product.insertMany(products);
    
    console.log(`✅ Successfully seeded ${createdProducts.length} products`);
    return createdProducts;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

module.exports = { seedProducts, createProducts };