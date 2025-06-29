const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  minBet: { type: Number, default: 10 },
  maxBet: { type: Number, default: 10000 },
  payoutMultiplier: { type: Number, default: 10 },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema); 