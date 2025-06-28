const Bet = require('../models/Bet');
const User = require('../models/User');
const Round = require('../models/Round');

// Place a bet
exports.placeBet = async (req, res) => {
  const userId = req.user.id;
  const { number, amount } = req.body;
  if (!number || !amount) return res.status(400).json({ message: 'Number and amount required' });
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  const user = await User.findById(userId);
  if (!user || user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

  // Find or create open round
  let round = await Round.findOne({ status: 'open' });
  if (!round) round = await Round.create({});

  // Deduct balance
  user.balance -= amount;
  await user.save();

  // Always use userId from JWT, never from client
  const bet = await Bet.create({ user: userId, round: round._id, number, amount });
  round.bets.push(bet._id);
  await round.save();

  res.json({ message: 'Bet placed', bet, balance: user.balance });
};

// Get user bet history
exports.getBetHistory = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;
  const query = { user: userId };
  if (status && ['pending', 'win', 'lose'].includes(status)) {
    query.result = status;
  }
  const bets = await Bet.find(query)
    .populate('round')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ bets });
};

// Migration endpoint: Remove bets with invalid user references
exports.cleanInvalidBets = async (req, res) => {
  const validUserIds = (await require('../models/User').find({}, '_id')).map(u => u._id);
  const result = await Bet.deleteMany({ user: { $nin: validUserIds } });
  res.json({ message: 'Cleaned up bets with invalid user references', deletedCount: result.deletedCount });
};

// List all bets (admin only)
exports.listAllBets = async (req, res) => {
  try {
    const bets = await Bet.find()
      .populate('user', 'name mobile')
      .populate('round', 'winningNumber createdAt')
      .sort({ createdAt: -1 });
    res.json({ bets });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bets' });
  }
};

// Get the current user's bets for the open round
exports.getCurrentBets = async (req, res) => {
  try {
    const userId = req.user.id;
    const round = await require('../models/Round').findOne({ status: 'open' });
    if (!round) return res.json({ bets: [] });
    const bets = await require('../models/Bet').find({ user: userId, round: round._id });
    res.json({ bets });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch current bets' });
  }
}; 