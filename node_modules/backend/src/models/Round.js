const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  winningNumber: { type: Number },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  bets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bet' }],
}, { timestamps: true });

module.exports = mongoose.model('Round', roundSchema); 