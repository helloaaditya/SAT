const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  number: { type: Number, required: true },
  amount: { type: Number, required: true },
  result: { type: String, enum: ['pending', 'win', 'lose'], default: 'pending' },
  payout: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Bet', betSchema); 