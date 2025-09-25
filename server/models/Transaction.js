const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: String,
    price: Number,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
});

const transactionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  transactionId: {
    type: String,
    required: true,
  },
  items: [transactionItemSchema],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital'],
    required: true
  },
  amountPaid: {
    type: Number,
    required: true,
    min: [0, 'Amount paid cannot be negative']
  },
  dueAmount: {
    type: Number,
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['completed', 'refunded', 'cancelled', 'due'],
    default: 'completed'
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for search and reporting
transactionSchema.index({ tenantId: 1, transactionId: 1 }, { unique: true });
transactionSchema.index({ tenantId: 1, cashier: 1 });
transactionSchema.index({ tenantId: 1, customer: 1 });
transactionSchema.index({ tenantId: 1, createdAt: -1 });
transactionSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);