const Bet = require('../models/Bet');
const Round = require('../models/Round');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');

// Get all bets for the current round
exports.getCurrentRoundBets = async (req, res) => {
  const round = await Round.findOne({ status: 'open' }).populate({ path: 'bets', populate: { path: 'user', select: 'mobile' } });
  if (!round) return res.json({ bets: [] });
  res.json({ bets: round.bets });
};

// Announce result and close round
exports.announceResult = async (req, res) => {
  try {
    console.log('=== ANNOUNCE RESULT START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('User:', req.user);
    
    // Check if req.body exists
    if (!req.body) {
      console.error('req.body is undefined - body parsing issue');
      return res.status(400).json({ 
        message: 'Request body is missing. Please ensure Content-Type is application/json',
        error: 'Body parsing failed'
      });
    }
    
    const { winningNumber } = req.body;
    console.log('Extracted winningNumber:', winningNumber);
    
    // Validate winning number
    if (winningNumber === undefined || winningNumber === null || winningNumber === '') {
      console.log('Validation failed: winningNumber is empty');
      return res.status(400).json({ message: 'Winning number is required' });
    }
    
    // Convert to number and validate range
    const winningNum = parseInt(winningNumber);
    console.log('Parsed winningNum:', winningNum);
    
    if (isNaN(winningNum) || winningNum < 0 || winningNum > 9) {
      console.log('Validation failed: winningNum out of range');
      return res.status(400).json({ message: 'Winning number must be between 0 and 9' });
    }
    
    console.log('Processing winning number:', winningNum);
    
    // Check if Round model is available
    if (!Round) {
      console.error('Round model is not available');
      return res.status(500).json({ message: 'Database model error' });
    }
    
    // Find open round
    console.log('Searching for open round...');
    let round = await Round.findOne({ status: 'open' }).populate('bets');
    console.log('Round search result:', round ? 'Found' : 'Not found');
    
    if (!round) {
      console.log('No open round found');
      return res.status(400).json({ message: 'No open round found' });
    }
    
    console.log('Found open round:', {
      roundId: round._id,
      betCount: round.bets ? round.bets.length : 0,
      roundStatus: round.status
    });
    
    // Update round with winning number and close it
    round.winningNumber = winningNum;
    round.status = 'closed';
    
    let totalBets = 0;
    let totalPayout = 0;
    
    // Process each bet
    if (round.bets && round.bets.length > 0) {
      console.log(`Processing ${round.bets.length} bets...`);
      
      for (const bet of round.bets) {
        console.log('Processing bet:', {
          betId: bet._id,
          amount: bet.amount,
          number: bet.number,
          user: bet.user
        });
        
        totalBets += bet.amount;
        
        if (String(bet.number) === String(winningNum)) {
          // Winning bet
          console.log('Winning bet found!');
          bet.result = 'win';
          bet.payout = bet.amount * 10;
          totalPayout += bet.payout;
          
          // Update user balance
          try {
            const user = await User.findById(bet.user);
            if (user) {
              user.balance += bet.payout;
              await user.save();
              console.log(`Updated user ${user._id} balance: +${bet.payout}`);
            } else {
              console.log('User not found for bet:', bet.user);
            }
          } catch (userError) {
            // Log user update error but continue processing other bets
            console.error('Error updating user balance:', userError);
          }
        } else {
          // Losing bet
          bet.result = 'lose';
          bet.payout = 0;
        }
        
        // Save bet
        try {
          await bet.save();
          console.log('Bet saved successfully');
        } catch (betError) {
          // Log bet save error but continue processing other bets
          console.error('Error saving bet:', betError);
        }
      }
    } else {
      console.log('No bets to process');
    }
    
    // Save round
    console.log('Saving round...');
    await round.save();
    console.log('Round saved successfully');
    
    const profit = totalBets - totalPayout;
    
    console.log('Result announced successfully:', {
      winningNumber: winningNum,
      totalBets,
      totalPayout,
      profit
    });
    
    console.log('=== ANNOUNCE RESULT SUCCESS ===');
    
    res.json({ 
      message: 'Result announced successfully', 
      winningNumber: winningNum,
      totalBets, 
      totalPayout, 
      profit
    });
    
  } catch (error) {
    console.error('=== ANNOUNCE RESULT ERROR ===');
    console.error('Error announcing result:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to announce result', 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Get all rounds
exports.getRounds = async (req, res) => {
  try {
    const rounds = await Round.find().populate('bets').sort({ createdAt: -1 }).limit(50);
    
    // Calculate totals for each round
    const roundsWithTotals = rounds.map(round => {
      const totalBets = round.bets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalPayout = round.bets.reduce((sum, bet) => sum + (bet.payout || 0), 0);
      const profit = totalBets - totalPayout;
      
      return {
        _id: round._id,
        id: round._id.toString().slice(-6), // Short ID for display
        status: round.status,
        winningNumber: round.winningNumber,
        createdAt: round.createdAt,
        totalBets,
        totalPayout,
        profit,
        betCount: round.bets.length
      };
    });
    
    res.json({ rounds: roundsWithTotals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rounds' });
  }
};

// Get all users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get platform stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBets = await Bet.countDocuments();
    const totalRounds = await Round.countDocuments();
    const totalPayouts = await Bet.aggregate([
      { $match: { result: 'win' } },
      { $group: { _id: null, total: { $sum: '$payout' } } }
    ]);
    const totalRevenue = await Bet.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const activeRounds = await Round.countDocuments({ status: 'open' });
    const completedRounds = await Round.countDocuments({ status: 'closed' });

    // Platform settings
    let platformStatus = await PlatformSettings.findOne();
    if (!platformStatus) {
      platformStatus = new PlatformSettings();
      await platformStatus.save();
    }

    // Financials
    const revenue = totalRevenue[0]?.total || 0;
    const payouts = totalPayouts[0]?.total || 0;
    const profit = revenue - payouts;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    res.json({
      totalUsers,
      totalBets,
      totalRounds,
      totalRevenue: revenue,
      totalPayouts: payouts,
      totalProfit: profit,
      profitMargin,
      activeRounds,
      completedRounds,
      platformStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// Get current round bet statistics
exports.getCurrentRoundBetStats = async (req, res) => {
  try {
    const round = await Round.findOne({ status: 'open' }).populate('bets');
    if (!round) return res.json({ bets: [], totalBets: 0, totalAmount: 0 });
    
    const totalBets = round.bets.length;
    const totalAmount = round.bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    res.json({ bets: round.bets, totalBets, totalAmount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bet stats' });
  }
};

// Update platform settings
exports.updateSettings = async (req, res) => {
  try {
    const { isActive, minBet, maxBet, payoutMultiplier, maintenanceMode } = req.body;
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings();
    }
    if (isActive !== undefined) settings.isActive = isActive;
    if (minBet !== undefined) settings.minBet = minBet;
    if (maxBet !== undefined) settings.maxBet = maxBet;
    if (payoutMultiplier !== undefined) settings.payoutMultiplier = payoutMultiplier;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

// Create new round
exports.createRound = async (req, res) => {
  try {
    // Close any existing open round
    await Round.updateMany({ status: 'open' }, { status: 'closed' });
    
    // Create new round
    const newRound = new Round({
      status: 'open',
      createdAt: new Date()
    });
    
    await newRound.save();
    res.json({ message: 'New round created successfully', round: newRound });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create new round' });
  }
}; 