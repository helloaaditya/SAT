const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Dummy isAdmin middleware (replace with real admin check)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: 'Admin access required' });
};

// UPI payment request (user)
router.post('/upi-request', auth, paymentController.createUpiPaymentRequest);

// Admin: list all UPI payment requests
router.get('/upi-requests', auth, isAdmin, paymentController.listUpiPaymentRequests);
// Admin: approve
router.post('/upi-requests/:id/approve', auth, isAdmin, paymentController.approveUpiPaymentRequest);
// Admin: reject
router.post('/upi-requests/:id/reject', auth, isAdmin, paymentController.rejectUpiPaymentRequest);

// Test endpoint to verify payment routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!' });
});

// Create payment session (requires authentication)
router.post('/create-session', auth, paymentController.createPaymentSession);

// Handle payment webhook (no authentication required)
router.post('/webhook', paymentController.handlePaymentWebhook);

// Verify payment status (requires authentication)
router.get('/verify/:transaction_id', auth, paymentController.verifyPayment);

// Get payment history (requires authentication)
router.get('/history', auth, paymentController.getPaymentHistory);

// Withdraw request (user)
router.post('/withdraw-request', auth, paymentController.createWithdrawRequest);

// User: get their own withdrawal requests OR Admin: get all requests
router.get('/withdraw-requests', auth, paymentController.getWithdrawRequests);

// Admin: list all withdraw requests (for admin panel)
router.get('/admin/withdraw-requests', auth, isAdmin, paymentController.listWithdrawRequests);

// Admin: approve/reject withdraw requests
router.post('/withdraw-requests/:id/approve', auth, isAdmin, paymentController.approveWithdrawRequest);
router.post('/withdraw-requests/:id/reject', auth, isAdmin, paymentController.rejectWithdrawRequest);

module.exports = router; 