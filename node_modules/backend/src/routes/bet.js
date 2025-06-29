const express = require('express');
const router = express.Router();
const { placeBet, getBetHistory, cleanInvalidBets, listAllBets, getCurrentBets } = require('../controllers/betController');
const auth = require('../middleware/auth');
const Round = require('../models/Round');
const Bet = require('../models/Bet');

router.post('/', auth, placeBet);
router.get('/history', auth, getBetHistory);

// Public: Get recent results from Bet collection, grouped by round
router.get('/results', async (req, res) => {
  try {
    // Find bets with a result (not pending), sort by most recent
    const bets = await Bet.find({ result: { $ne: 'pending' } })
      .populate('round')
      .sort({ createdAt: -1 })
      .limit(200);
    // Group by round
    const roundMap = new Map();
    bets.forEach(bet => {
      const roundId = bet.round?._id?.toString() || (bet.round + '');
      if (!roundMap.has(roundId)) {
        roundMap.set(roundId, {
          round: roundId,
          winningNumber: bet.round?.winningNumber || null,
          date: bet.round?.createdAt || bet.createdAt,
          status: bet.result,
        });
      }
    });
    const results = Array.from(roundMap.values()).slice(0, 50);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

// Public: Get next scheduled result time
router.get('/next-result-time', async (req, res) => {
  try {
    // Scheduled result hours in 24h format
    const resultHours = [11, 15, 21];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let nextTime = null;
    for (let h of resultHours) {
      const t = new Date(today.getTime());
      t.setHours(h, 0, 0, 0);
      if (t > now) {
        nextTime = t;
        break;
      }
    }
    // If all times today have passed, next is tomorrow 11:00
    if (!nextTime) {
      nextTime = new Date(today.getTime());
      nextTime.setDate(today.getDate() + 1);
      nextTime.setHours(resultHours[0], 0, 0, 0);
    }
    
    // Return both server time and next result time to ensure synchronization
    res.json({ 
      nextResultTime: nextTime.toISOString(),
      serverTime: now.toISOString(),
      timezone: 'Asia/Kolkata' // Indian Standard Time
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get next result time' });
  }
});

const admin = (req, res, next) => req.user.isAdmin ? next() : res.status(403).json({ message: 'Admin only' });

router.delete('/clean-invalid', auth, admin, cleanInvalidBets);
router.get('/all', auth, admin, listAllBets);
router.get('/current', auth, getCurrentBets);

module.exports = router; 