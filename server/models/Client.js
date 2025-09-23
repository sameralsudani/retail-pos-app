const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: [0, 'Total revenue cannot be negative']
  },
  activeInvoices: {
    type: Number,
    default: 0,
    min: [0, 'Active invoices cannot be negative']
  },
  projects: {
    type: Number,
    default: 0,
    min: [0, 'Projects cannot be negative']
  },
  lastTransaction: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    default: function() {
      return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
clientSchema.index({ tenantId: 1, name: 'text', email: 'text' });
clientSchema.index({ tenantId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);