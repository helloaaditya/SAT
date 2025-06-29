const express = require('express');
const router = express.Router();
const { getCurrentRoundBets, announceResult, getRounds, listUsers, getStats, getCurrentRoundBetStats, updateSettings, createRound } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = (req, res, next) => req.user.isAdmin ? next() : res.status(403).json({ message: 'Admin only' });

router.get('/bets', auth, admin, getCurrentRoundBets);
router.post('/announce', auth, admin, announceResult);
router.get('/rounds', auth, admin, getRounds);
router.get('/users', auth, admin, listUsers);
router.get('/stats', auth, admin, getStats);
router.get('/current-round-bet-stats', auth, admin, getCurrentRoundBetStats);
router.post('/update-settings', auth, admin, updateSettings);
router.post('/create-round', auth, admin, createRound);

// Test endpoint to check database state
router.get('/test-db', auth, admin, async (req, res) => {
  try {
    const Round = require('../models/Round');
    const Bet = require('../models/Bet');
    const User = require('../models/User');
    
    const openRounds = await Round.find({ status: 'open' });
    const allRounds = await Round.countDocuments();
    const allBets = await Bet.countDocuments();
    const allUsers = await User.countDocuments();
    
    res.json({
      openRounds: openRounds.length,
      totalRounds: allRounds,
      totalBets: allBets,
      totalUsers: allUsers,
      openRoundDetails: openRounds.map(r => ({
        id: r._id,
        status: r.status,
        winningNumber: r.winningNumber,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Database test failed', error: error.message });
  }
});

// Admin: Get result reminder status
router.get('/result-reminder', auth, admin, async (req, res) => {
  try {
    const resultHours = [11, 15, 21];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find next result time (for reference only)
    let nextTime = null;
    for (let h of resultHours) {
      const t = new Date(today.getTime());
      t.setHours(h, 0, 0, 0);
      if (t > now) {
        nextTime = t;
        break;
      }
    }
    if (!nextTime) {
      nextTime = new Date(today.getTime());
      nextTime.setDate(today.getDate() + 1);
      nextTime.setHours(resultHours[0], 0, 0, 0);
    }
    
    // Check if there's an open round that needs manual announcement
    const Round = require('../models/Round');
    const openRound = await Round.findOne({ status: 'open' });
    const needsAnnouncement = !!openRound;
    
    res.json({
      nextResultTime: nextTime.toISOString(),
      needsAnnouncement,
      message: needsAnnouncement ? 'Manual result announcement required' : 'No open round to announce',
      scheduledTimes: resultHours.map(h => `${h}:00`),
      note: 'Results are announced manually by admin at any time'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get result reminder' });
  }
});

module.exports = router; 