const Bet = require('../models/Bet');
const Round = require('../models/Round');
const User = require('../models/User');

// Get all bets for the current round
exports.getCurrentRoundBets = async (req, res) => {
  const round = await Round.findOne({ status: 'open' }).populate({ path: 'bets', populate: { path: 'user', select: 'mobile' } });
  if (!round) return res.json({ bets: [] });
  res.json({ bets: round.bets });
};

// Announce result and close round
exports.announceResult = async (req, res) => {
  const { winningNumber } = req.body;
  let round = await Round.findOne({ status: 'open' }).populate('bets');
  if (!round) return res.status(400).json({ message: 'No open round' });
  round.winningNumber = winningNumber;
  round.status = 'closed';
  let totalBets = 0, totalPayout = 0;
  for (const bet of round.bets) {
    totalBets += bet.amount;
    if (String(bet.number) === String(winningNumber)) {
      bet.result = 'win';
      bet.payout = bet.amount * 10;
      totalPayout += bet.payout;
      const user = await User.findById(bet.user);
      user.balance += bet.payout;
      await user.save();
      console.log(`WIN: User ${user._id} bet ${bet.amount} on ${bet.number}, payout: ${bet.payout}, new balance: ${user.balance}`);
    } else {
      bet.result = 'lose';
      bet.payout = 0;
      console.log(`LOSE: User ${bet.user} bet ${bet.amount} on ${bet.number}`);
    }
    await bet.save();
  }
  await round.save();
  console.log(`Result announced: winningNumber=${winningNumber}, totalBets=${totalBets}, totalPayout=${totalPayout}, profit=${totalBets - totalPayout}`);
  res.json({ message: 'Result announced', totalBets, totalPayout, profit: totalBets - totalPayout });
};

// Get past rounds with profit/loss
exports.getRounds = async (req, res) => {
  const rounds = await Round.find({ status: 'closed' }).sort({ createdAt: -1 }).limit(10).populate('bets');
  const data = rounds.map(r => {
    const totalBets = r.bets.reduce((sum, b) => sum + b.amount, 0);
    const totalPayout = r.bets.reduce((sum, b) => sum + b.payout, 0);
    return {
      id: r._id,
      winningNumber: r.winningNumber,
      createdAt: r.createdAt,
      totalBets,
      totalPayout,
      profit: totalBets - totalPayout,
    };
  });
  res.json({ rounds: data });
};

// List all users (admin only)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Platform stats (admin only)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBets = await Bet.countDocuments();
    const rounds = await Round.find({ status: 'closed' }).populate('bets');
    let totalProfit = 0;
    for (const r of rounds) {
      const totalBetsAmt = r.bets.reduce((sum, b) => sum + b.amount, 0);
      const totalPayout = r.bets.reduce((sum, b) => sum + b.payout, 0);
      totalProfit += totalBetsAmt - totalPayout;
    }
    res.json({ totalUsers, totalBets, totalProfit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// Get stats for current round bets (admin only)
exports.getCurrentRoundBetStats = async (req, res) => {
  try {
    const round = await require('../models/Round').findOne({ status: 'open' }).populate('bets');
    if (!round || !round.bets.length) return res.json({ totalBets: 0, betsByNumber: {}, minNumber: null, minNumberTotal: 0, potentialPayout: 0, profitIfMinWins: 0 });
    const betsByNumber = {};
    let totalBets = 0;
    round.bets.forEach(bet => {
      totalBets += bet.amount;
      betsByNumber[bet.number] = (betsByNumber[bet.number] || 0) + bet.amount;
    });
    // Find the number with the minimum total bet
    let minNumber = null, minNumberTotal = Infinity;
    Object.entries(betsByNumber).forEach(([num, amt]) => {
      if (amt < minNumberTotal) {
        minNumber = num;
        minNumberTotal = amt;
      }
    });
    // Calculate potential payout and profit if minNumber wins
    const potentialPayout = minNumberTotal * 10; // 10x multiplier
    const profitIfMinWins = totalBets - potentialPayout;
    res.json({ totalBets, betsByNumber, minNumber, minNumberTotal, potentialPayout, profitIfMinWins });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch current round bet stats' });
  }
}; 