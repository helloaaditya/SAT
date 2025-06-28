const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  order_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 50
  },
  currency: {
    type: String,
    default: 'INR'
  },
  gateway: {
    type: String,
    default: 'paycashwallet'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  customer_details: {
    name: String,
    email: String,
    mobile: String
  },
  payment_url: String,
  return_url: String,
  cancel_url: String,
  webhook_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  processed_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
paymentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Index for faster queries
paymentSchema.index({ user: 1, created_at: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 