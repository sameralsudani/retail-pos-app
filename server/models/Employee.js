const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Management', 'Sales', 'Inventory', 'Pharmacy', 'Security', 'Customer Service'],
    default: 'Sales'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  },
  shift: {
    type: String,
    required: [true, 'Shift is required'],
    trim: true
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  hoursThisWeek: {
    type: Number,
    default: 0,
    min: [0, 'Hours cannot be negative']
  },
  performance: {
    type: Number,
    default: 85,
    min: [0, 'Performance cannot be negative'],
    max: [100, 'Performance cannot exceed 100']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
employeeSchema.index({ tenantId: 1, name: 'text', email: 'text', employeeId: 'text' });
employeeSchema.index({ tenantId: 1, email: 1 }, { unique: true });
employeeSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);