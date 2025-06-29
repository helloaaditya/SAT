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
    const { amount, currency, description, return_url, cancel_url } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount is missing or empty' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing from token' });
    }

    // Check minimum amount
    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum amount is ₹10' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create payment record
    const paymentData = {
      user: userId,
      amount: amount,
      status: 'pending',
      paymentMethod: 'upi',
      upiId: 'sattawala@paytm', // Mock UPI ID
      orderId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: `Add money to ${user.mobile || user.email}`
    };

    const payment = new UpiPaymentRequest(paymentData);
    await payment.save();

    // Mock payment URL (in real implementation, this would be from payment gateway)
    const mockPaymentUrl = `upi://pay?pa=${paymentData.upiId}&pn=SattaWala&am=${amount}&tn=Add Money&cu=INR&ref=${paymentData.orderId}`;

    const responseData = {
      success: true,
      paymentUrl: mockPaymentUrl,
      orderId: paymentData.orderId,
      amount: amount,
      upiId: paymentData.upiId,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        orderId: payment.orderId,
        createdAt: payment.createdAt
      }
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment session' });
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
      }
    }

    await payment.save();

    res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find payment record
    const payment = await UpiPaymentRequest.findOne({ 
      orderId: orderId,
      user: userId,
      status: 'pending'
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or already processed' });
    }

    // Mock verification (in real implementation, verify with payment gateway)
    // For demo purposes, we'll mark it as successful
    payment.status = 'completed';
    payment.verifiedAt = new Date();
    await payment.save();

    // Add money to user's balance
    const user = await User.findById(userId);
    if (user) {
      user.balance += payment.amount;
      await user.save();
    }

    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      amount: payment.amount,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await UpiPaymentRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ payments });
  } catch (error) {
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