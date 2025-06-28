const mongoose = require('mongoose');

const upiPaymentRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  utr: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: String,
  processedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('UpiPaymentRequest', upiPaymentRequestSchema); 