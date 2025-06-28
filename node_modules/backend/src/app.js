const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const cron = require('node-cron');
const Round = require('./models/Round');
const Bet = require('./models/Bet');
const User = require('./models/User');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

console.log('Loading routes...');

// Load routes with error handling
try {
  console.log('Loading auth routes...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('Auth routes loaded successfully');
} catch (error) {
  console.error('Error loading auth routes:', error);
}

try {
  console.log('Loading bet routes...');
  app.use('/api/bet', require('./routes/bet'));
  console.log('Bet routes loaded successfully');
} catch (error) {
  console.error('Error loading bet routes:', error);
}

try {
  console.log('Loading admin routes...');
  app.use('/api/admin', require('./routes/admin'));
  console.log('Admin routes loaded successfully');
} catch (error) {
  console.error('Error loading admin routes:', error);
}

try {
  console.log('Loading payment routes...');
  app.use('/api/payment', require('./routes/payment'));
  console.log('Payment routes loaded successfully');
} catch (error) {
  console.error('Error loading payment routes:', error);
}

// Auto announce result at 11:00, 15:00, 21:00 every day
cron.schedule('0 11,15,21 * * *', async () => {
  try {
    const round = await Round.findOne({ status: 'open' }).populate('bets');
    if (!round) return;
    // Pick a random winning number from 1-20
    const winningNumber = Math.floor(Math.random() * 20) + 1;
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
      } else {
        bet.result = 'lose';
        bet.payout = 0;
      }
      await bet.save();
    }
    await round.save();
    console.log(`[CRON] Result announced at ${new Date().toLocaleString()}: winningNumber=${winningNumber}, totalBets=${totalBets}, totalPayout=${totalPayout}, profit=${totalBets - totalPayout}`);
  } catch (err) {
    console.error('[CRON] Error announcing result:', err);
  }
});

console.log('All routes loaded');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 