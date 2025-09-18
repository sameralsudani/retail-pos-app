const Transaction = require('../models/Transaction');

const createSampleTransactions = (users, customers, products) => {
  const adminUser = users.find(u => u.role === 'admin')._id;
  const cashierUser = users.find(u => u.role === 'cashier')._id;
  const managerUser = users.find(u => u.role === 'manager')._id;

  const customer1 = customers[0]._id;
  const customer2 = customers[1]._id;
  const customer3 = customers[2]._id;

  // Helper function to generate transaction ID
  const generateTransactionId = (index) => {
    const timestamp = Date.now() - (index * 3600000); // Spread transactions over time
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  };

  const transactions = [
    // Transaction 1 - Coffee and pastry
    {
      transactionId: generateTransactionId(1),
      items: [
        {
          product: products.find(p => p.sku === 'BEV001')._id,
          productSnapshot: {
            name: 'Premium Coffee Beans',
            price: 24.99,
            sku: 'BEV001'
          },
          quantity: 1,
          unitPrice: 24.99,
          totalPrice: 24.99
        },
        {
          product: products.find(p => p.sku === 'BAK002')._id,
          productSnapshot: {
            name: 'Fresh Croissants',
            price: 3.75,
            sku: 'BAK002'
          },
          quantity: 2,
          unitPrice: 3.75,
          totalPrice: 7.50
        }
      ],
      customer: customer1,
      cashier: cashierUser,
      subtotal: 32.49,
      tax: 2.60,
      total: 35.09,
      paymentMethod: 'cash',
      amountPaid: 40.00,
      change: 4.91,
      loyaltyPointsEarned: 35
    },

    // Transaction 2 - Electronics purchase
    {
      transactionId: generateTransactionId(2),
      items: [
        {
          product: products.find(p => p.sku === 'ELE001')._id,
          productSnapshot: {
            name: 'Wireless Headphones',
            price: 89.99,
            sku: 'ELE001'
          },
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99
        },
        {
          product: products.find(p => p.sku === 'ELE002')._id,
          productSnapshot: {
            name: 'Smartphone Case',
            price: 29.99,
            sku: 'ELE002'
          },
          quantity: 1,
          unitPrice: 29.99,
          totalPrice: 29.99
        }
      ],
      customer: customer2,
      cashier: managerUser,
      subtotal: 119.98,
      tax: 9.60,
      total: 129.58,
      paymentMethod: 'card',
      amountPaid: 129.58,
      change: 0,
      loyaltyPointsEarned: 129
    },

    // Transaction 3 - Grocery shopping
    {
      transactionId: generateTransactionId(3),
      items: [
        {
          product: products.find(p => p.sku === 'PRO001')._id,
          productSnapshot: {
            name: 'Organic Apples',
            price: 4.99,
            sku: 'PRO001'
          },
          quantity: 3,
          unitPrice: 4.99,
          totalPrice: 14.97
        },
        {
          product: products.find(p => p.sku === 'PRO002')._id,
          productSnapshot: {
            name: 'Fresh Bananas',
            price: 2.99,
            sku: 'PRO002'
          },
          quantity: 2,
          unitPrice: 2.99,
          totalPrice: 5.98
        },
        {
          product: products.find(p => p.sku === 'PRO005')._id,
          productSnapshot: {
            name: 'Avocados',
            price: 1.99,
            sku: 'PRO005'
          },
          quantity: 4,
          unitPrice: 1.99,
          totalPrice: 7.96
        }
      ],
      customer: customer3,
      cashier: cashierUser,
      subtotal: 28.91,
      tax: 2.31,
      total: 31.22,
      paymentMethod: 'cash',
      amountPaid: 35.00,
      change: 3.78,
      loyaltyPointsEarned: 31
    },

    // Transaction 4 - Office supplies
    {
      transactionId: generateTransactionId(4),
      items: [
        {
          product: products.find(p => p.sku === 'STA001')._id,
          productSnapshot: {
            name: 'Notebook Set',
            price: 15.99,
            sku: 'STA001'
          },
          quantity: 2,
          unitPrice: 15.99,
          totalPrice: 31.98
        },
        {
          product: products.find(p => p.sku === 'STA002')._id,
          productSnapshot: {
            name: 'Premium Pens',
            price: 8.99,
            sku: 'STA002'
          },
          quantity: 3,
          unitPrice: 8.99,
          totalPrice: 26.97
        },
        {
          product: products.find(p => p.sku === 'STA004')._id,
          productSnapshot: {
            name: 'Highlighter Set',
            price: 7.99,
            sku: 'STA004'
          },
          quantity: 1,
          unitPrice: 7.99,
          totalPrice: 7.99
        }
      ],
      customer: null, // Walk-in customer
      cashier: adminUser,
      subtotal: 66.94,
      tax: 5.36,
      total: 72.30,
      paymentMethod: 'cash',
      amountPaid: 75.00,
      change: 2.70,
      loyaltyPointsEarned: 0
    },

    // Transaction 5 - Fashion purchase
    {
      transactionId: generateTransactionId(5),
      items: [
        {
          product: products.find(p => p.sku === 'CLO001')._id,
          productSnapshot: {
            name: 'Designer T-Shirt',
            price: 34.99,
            sku: 'CLO001'
          },
          quantity: 2,
          unitPrice: 34.99,
          totalPrice: 69.98
        },
        {
          product: products.find(p => p.sku === 'CLO004')._id,
          productSnapshot: {
            name: 'Baseball Cap',
            price: 24.99,
            sku: 'CLO004'
          },
          quantity: 1,
          unitPrice: 24.99,
          totalPrice: 24.99
        }
      ],
      customer: customers[4]._id,
      cashier: cashierUser,
      subtotal: 94.97,
      tax: 7.60,
      total: 102.57,
      paymentMethod: 'card',
      amountPaid: 102.57,
      change: 0,
      loyaltyPointsEarned: 102
    },

    // Transaction 6 - Health products
    {
      transactionId: generateTransactionId(6),
      items: [
        {
          product: products.find(p => p.sku === 'HLT001')._id,
          productSnapshot: {
            name: 'Hand Sanitizer',
            price: 6.99,
            sku: 'HLT001'
          },
          quantity: 3,
          unitPrice: 6.99,
          totalPrice: 20.97
        },
        {
          product: products.find(p => p.sku === 'HLT003')._id,
          productSnapshot: {
            name: 'Vitamin C Tablets',
            price: 14.99,
            sku: 'HLT003'
          },
          quantity: 1,
          unitPrice: 14.99,
          totalPrice: 14.99
        }
      ],
      customer: customers[5]._id,
      cashier: managerUser,
      subtotal: 35.96,
      tax: 2.88,
      total: 38.84,
      paymentMethod: 'digital',
      amountPaid: 38.84,
      change: 0,
      loyaltyPointsEarned: 38
    },

    // Transaction 7 - Snack run
    {
      transactionId: generateTransactionId(7),
      items: [
        {
          product: products.find(p => p.sku === 'SNK001')._id,
          productSnapshot: {
            name: 'Mixed Nuts',
            price: 12.99,
            sku: 'SNK001'
          },
          quantity: 1,
          unitPrice: 12.99,
          totalPrice: 12.99
        },
        {
          product: products.find(p => p.sku === 'SNK002')._id,
          productSnapshot: {
            name: 'Potato Chips',
            price: 3.99,
            sku: 'SNK002'
          },
          quantity: 2,
          unitPrice: 3.99,
          totalPrice: 7.98
        },
        {
          product: products.find(p => p.sku === 'BEV005')._id,
          productSnapshot: {
            name: 'Energy Drink',
            price: 3.49,
            sku: 'BEV005'
          },
          quantity: 1,
          unitPrice: 3.49,
          totalPrice: 3.49
        }
      ],
      customer: customers[6]._id,
      cashier: cashierUser,
      subtotal: 24.46,
      tax: 1.96,
      total: 26.42,
      paymentMethod: 'cash',
      amountPaid: 30.00,
      change: 3.58,
      loyaltyPointsEarned: 26
    }
  ];

  return transactions;
};

const seedTransactions = async (users, customers, products) => {
  try {
    console.log('🧾 Seeding transactions...');
    
    // Clear existing transactions
    await Transaction.deleteMany({});
    
    // Create sample transactions
    const transactions = createSampleTransactions(users, customers, products);
    
    // Insert new transactions
    const createdTransactions = await Transaction.insertMany(transactions);
    
    console.log(`✅ Successfully seeded ${createdTransactions.length} transactions`);
    return createdTransactions;
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
    throw error;
  }
};

module.exports = { seedTransactions, createSampleTransactions };