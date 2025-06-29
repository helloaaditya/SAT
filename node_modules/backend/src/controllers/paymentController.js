const User = require('../models/User');
const Payment = require('../models/Payment');
const crypto = require('crypto');
const UpiPaymentRequest = require('../models/UpiPaymentRequest');
const WithdrawRequest = require('../models/WithdrawRequest');

// Generate signature for PayCash wallet
const generateSignature = (data, secretKey) => {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys.map(key => `${key}=${data[key]}`).join('&') + secretKey;
  return crypto.createHash('sha256').update(signatureString).digest('hex');
};

// Create payment session for PayCash wallet
const createPaymentSession = async (req, res) => {
  try {
    console.log('Payment session request received:', req.body);
    console.log('User from token:', req.user);

    const { amount, currency, description, return_url, cancel_url } = req.body;
    const userId = req.user.id;

    // Validate required parameters
    if (!amount) {
      console.log('Amount is missing or empty');
      return res.status(400).json({ message: 'Amount is required' });
    }

    if (!userId) {
      console.log('User ID is missing from token');
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Validate amount (minimum ₹50)
    if (amount < 50) {
      console.log('Amount is below minimum:', amount);
      return res.status(400).json({ message: 'Minimum amount is ₹50' });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email || user.mobile);

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // PayCash wallet API configuration
    const paycashConfig = {
      merchant_id: process.env.PAYCASH_MERCHANT_ID || 'demo_merchant',
      api_key: process.env.PAYCASH_API_KEY || 'demo_key',
      gateway_url: 'https://pay.showcashwallet.com/api/v1/create-order',
      return_url: return_url || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/bet`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/bet`
    };

    console.log('Creating payment record with data:', {
      user: userId,
      amount,
      currency: currency || 'INR',
      description: description || `Add money to SattaWala wallet - ₹${amount}`
    });

    // Create payment record in database
    const payment = new Payment({
      user: userId,
      transaction_id: transactionId,
      order_id: orderId,
      amount: amount,
      currency: currency || 'INR',
      description: description || `Add money to SattaWala wallet - ₹${amount}`,
      customer_details: {
        name: user.name || user.mobile,
        email: user.email || `${user.mobile}@sattawala.com`,
        mobile: user.mobile
      },
      return_url: paycashConfig.return_url,
      cancel_url: paycashConfig.cancel_url,
      status: 'pending'
    });

    await payment.save();
    console.log('Payment record saved successfully');

    // In production, you would make an actual API call to PayCash wallet
    // For demo purposes, we'll create a mock payment URL with all required parameters
    const paymentData = {
      merchant_id: paycashConfig.merchant_id,
      order_id: orderId,
      amount: amount,
      currency: currency || 'INR',
      description: description || `Add money to SattaWala wallet - ₹${amount}`,
      customer_name: user.name || user.mobile,
      customer_email: user.email || `${user.mobile}@sattawala.com`,
      customer_mobile: user.mobile,
      return_url: paycashConfig.return_url,
      cancel_url: paycashConfig.cancel_url,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/webhook`,
      timestamp: Date.now()
    };

    // Generate signature
    const signature = generateSignature(paymentData, paycashConfig.api_key);
    paymentData.signature = signature;

    // Build payment URL
    const queryParams = Object.keys(paymentData)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paymentData[key])}`)
      .join('&');
    
    const mockPaymentUrl = `https://pay.showcashwallet.com/pay?${queryParams}`;

    console.log('Generated payment URL:', mockPaymentUrl);
    console.log('Payment data:', paymentData);

    // Update payment record with payment URL
    payment.payment_url = mockPaymentUrl;
    await payment.save();

    console.log('Payment session created successfully:', {
      transaction_id: transactionId,
      order_id: orderId,
      amount: amount,
      payment_url: mockPaymentUrl
    });

    res.json({
      success: true,
      payment_url: mockPaymentUrl,
      transaction_id: transactionId,
      order_id: orderId,
      amount: amount,
      message: 'Payment session created successfully'
    });

  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({ message: 'Failed to create payment session', error: error.message });
  }
};

// Handle payment webhook from PayCash wallet
const handlePaymentWebhook = async (req, res) => {
  try {
    const {
      order_id,
      transaction_id,
      amount,
      status,
      signature,
      customer_mobile
    } = req.body;

    // Verify webhook signature (implement proper signature verification)
    // const isValidSignature = verifySignature(req.body, signature);
    // if (!isValidSignature) {
    //   return res.status(400).json({ message: 'Invalid signature' });
    // }

    // Find payment record
    const payment = await Payment.findOne({ order_id: order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    payment.status = status;
    payment.webhook_data = req.body;
    
    if (status === 'success') {
      payment.processed_at = new Date();
      
      // Update user balance
      const user = await User.findById(payment.user);
      if (user) {
        user.balance += parseFloat(amount);
        await user.save();
        console.log(`Payment successful: ${amount} added to user ${user.mobile}`);
      }
    }

    await payment.save();

    res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// Verify payment status
const verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ 
      transaction_id: transaction_id,
      user: userId 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      success: true,
      payment: {
        transaction_id: payment.transaction_id,
        order_id: payment.order_id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        created_at: payment.created_at,
        processed_at: payment.processed_at
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

// Get payment history for user
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .select('-webhook_data');

    const total = await Payment.countDocuments({ user: userId });

    res.json({
      success: true,
      payments: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// User submits a UPI payment request
const createUpiPaymentRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, utr } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ message: 'Invalid amount' });
    if (!utr || utr.length < 6) return res.status(400).json({ message: 'Invalid UTR/Transaction ID' });
    // Prevent duplicate UTR for same user
    const exists = await UpiPaymentRequest.findOne({ user: userId, utr });
    if (exists) return res.status(400).json({ message: 'This UTR has already been submitted.' });
    const reqDoc = await UpiPaymentRequest.create({ user: userId, amount, utr });
    res.json({ success: true, request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit payment request' });
  }
};

// Admin: list all UPI payment requests (optionally filter by status)
const listUpiPaymentRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await UpiPaymentRequest.find(filter).populate('user', 'email mobile name').sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch UPI payment requests' });
  }
};

// Admin: approve a UPI payment request
const approveUpiPaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await UpiPaymentRequest.findById(id).populate('user');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    // Credit user balance
    reqDoc.user.balance += reqDoc.amount;
    await reqDoc.user.save();
    reqDoc.status = 'approved';
    reqDoc.processedAt = new Date();
    await reqDoc.save();
    res.json({ success: true, request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve request' });
  }
};

// Admin: reject a UPI payment request
const rejectUpiPaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const reqDoc = await UpiPaymentRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    reqDoc.status = 'rejected';
    reqDoc.adminNote = adminNote || '';
    reqDoc.processedAt = new Date();
    await reqDoc.save();
    res.json({ success: true, request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject request' });
  }
};

// User submits a withdraw request
const createWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, accountNumber, reAccountNumber, ifsc, amount } = req.body;
    if (!name || !accountNumber || !reAccountNumber || !ifsc || !amount) return res.status(400).json({ message: 'All fields are required' });
    if (accountNumber !== reAccountNumber) return res.status(400).json({ message: 'Account numbers do not match' });
    if (amount < 100) return res.status(400).json({ message: 'Minimum withdrawal amount is ₹100' });
    const user = await User.findById(userId);
    if (!user || user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    const reqDoc = await WithdrawRequest.create({ user: userId, name, accountNumber, ifsc, amount });
    user.balance -= amount;
    await user.save();
    res.json({ success: true, request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit withdraw request' });
  }
};

// Get withdraw requests (user's own or all if admin)
const getWithdrawRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    
    let requests;
    if (isAdmin) {
      // Admin can see all requests
      requests = await WithdrawRequest.find()
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 });
    } else {
      // User can only see their own requests
      requests = await WithdrawRequest.find({ user: userId })
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 });
    }
    
    res.json({ requests });
  } catch (error) {
    console.error('Error getting withdraw requests:', error);
    res.status(500).json({ message: 'Failed to get withdraw requests' });
  }
};

// List all withdraw requests (admin only - for admin panel)
const listWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find()
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    console.error('Error listing withdraw requests:', error);
    res.status(500).json({ message: 'Failed to list withdraw requests' });
  }
};

// Approve withdraw request (admin only)
const approveWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await WithdrawRequest.findById(id).populate('user');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    reqDoc.status = 'approved';
    reqDoc.processedAt = new Date();
    await reqDoc.save();
    res.json({ success: true, request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve request' });
  }
};

// Admin: reject a withdraw request
const rejectWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const reqDoc = await WithdrawRequest.findById(id).populate('user');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    reqDoc.status = 'rejected';
    reqDoc.adminNote = adminNote || '';
    reqDoc.processedAt = new Date();
    // Refund amount to user
    if (reqDoc.amount && reqDoc.user) {
      reqDoc.user.balance += reqDoc.amount;
      await reqDoc.user.save();
    }
    await reqDoc.save();
    res.json({ success: true, request: reqDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject request' });
  }
};

module.exports = {
  createPaymentSession,
  handlePaymentWebhook,
  verifyPayment,
  getPaymentHistory,
  createUpiPaymentRequest,
  listUpiPaymentRequests,
  approveUpiPaymentRequest,
  rejectUpiPaymentRequest,
  createWithdrawRequest,
  getWithdrawRequests,
  listWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest
}; 