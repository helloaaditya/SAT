const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, ref } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists with email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if mobile number is already taken (if provided)
    if (mobile) {
      const existingUserByMobile = await User.findOne({ mobile });
      if (existingUserByMobile) {
        return res.status(400).json({ message: 'User with this mobile number already exists' });
      }
    }

    // Create new user
    const userData = {
      name,
      email,
      password
    };

    // Add mobile if provided
    if (mobile) {
      userData.mobile = mobile;
    }

    // Generate unique referral code for this user
    const referralCode = Math.random().toString(36).substring(2, 8) + Date.now().toString().slice(-4);
    userData.referralCode = referralCode;
    // Handle referral
    if (ref) {
      const referrer = await User.findOne({ referralCode: ref });
      if (referrer) {
        userData.referredBy = referrer._id;
        referrer.balance += 25;
        await referrer.save();
        userData.balance = 25; // New user also gets ₹25
      }
    }

    // All new users get ₹25 by default
    userData.balance = 25;

    const user = new User(userData);
    await user.save();
    // Extra safety: ensure new user gets ₹25 if referred
    if (userData.balance === 25 && user.balance !== 25) {
      user.balance = 25;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.isAdmin
    };

    // Add mobile to response if it exists
    if (user.mobile) {
      userResponse.mobile = user.mobile;
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate referral code for old users if missing
    if (!user.referralCode) {
      user.referralCode = Math.random().toString(36).substring(2, 8) + Date.now().toString().slice(-4);
      await user.save();
      user = await User.findById(user._id); // Fetch updated user
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.isAdmin
    };

    // Add mobile to response if it exists
    if (user.mobile) {
      userData.mobile = user.mobile;
    }

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 