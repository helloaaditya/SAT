const express = require('express');
const router = express.Router();
const { getCurrentRoundBets, announceResult, getRounds, listUsers, getStats, getCurrentRoundBetStats } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = (req, res, next) => req.user.isAdmin ? next() : res.status(403).json({ message: 'Admin only' });

router.get('/bets', auth, admin, getCurrentRoundBets);
router.post('/announce', auth, admin, announceResult);
router.get('/rounds', auth, admin, getRounds);
router.get('/users', auth, admin, listUsers);
router.get('/stats', auth, admin, getStats);
router.get('/current-round-bet-stats', auth, admin, getCurrentRoundBetStats);

// Admin: Get result reminder status
router.get('/result-reminder', auth, admin, async (req, res) => {
  try {
    const resultHours = [11, 15, 21];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find next result time
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
    
    // Check if it's time to announce (within 5 minutes)
    const timeDiff = nextTime - now;
    const minutesUntilResult = Math.floor(timeDiff / 60000);
    const shouldAnnounce = minutesUntilResult <= 5 && minutesUntilResult >= 0;
    
    res.json({
      nextResultTime: nextTime.toISOString(),
      minutesUntilResult,
      shouldAnnounce,
      isResultTime: minutesUntilResult === 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get result reminder' });
  }
});

module.exports = router; 