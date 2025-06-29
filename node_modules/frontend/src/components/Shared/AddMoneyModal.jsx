import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { apiCall } from '../../utils/api';

const UPI_ID = '8797223004@ptsbi';
const UPI_NAME = 'SattaWala'; // Optional display name

const AddMoneyModal = ({ isOpen, onClose, onSuccess, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Predefined amounts
  const predefinedAmounts = [50, 100, 200, 500, 1000, 2000, 5000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setError('');
    setSuccess('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!amount || amount < 50) {
      setError('Minimum amount is ₹50');
      return;
    }
    if (!utr || utr.length < 6) {
      setError('Please enter a valid UTR/Transaction ID');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiCall('/api/payment/upi-request', {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(amount), utr })
      });
      setSuccess('Your payment request has been submitted! Pending admin approval.');
      setUtr('');
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit payment request');
    } finally {
      setLoading(false);
    }
  };

  // UPI QR code string
  const upiString = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount || ''}&cu=INR`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full text-white max-h-[90vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/10 z-10 pb-2">
          <h2 className="text-2xl font-bold text-yellow-400">💰 Add Money via UPI</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Current Balance */}
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30">
            <div className="text-center">
              <div className="text-sm text-gray-300">Current Balance</div>
              <div className="text-2xl font-bold text-green-400">₹{currentBalance}</div>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Select Amount (Min ₹50)</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {predefinedAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => handleAmountSelect(amt)}
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    amount === amt.toString()
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <div className="font-bold text-lg">₹{amt}</div>
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Or Enter Custom Amount
              </label>
              <input
                type="number"
                min="50"
                placeholder="Enter amount (min ₹50)"
                value={amount}
                onChange={handleCustomAmount}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* UPI QR Code */}
          {amount >= 50 && (
            <div className="flex flex-col items-center">
              <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
                <QRCode value={upiString} size={180} />
              </div>
              <div className="mt-2 text-sm text-gray-300 text-center">
                Scan this QR code with any UPI app to pay<br />
                <span className="font-bold text-yellow-400">₹{amount}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400 break-all">
                <span className="font-semibold">UPI String:</span> <span className="select-all">{upiString}</span>
              </div>
            </div>
          )}

          {/* UTR Input */}
          {amount >= 50 && (
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                Enter UTR/Transaction ID after payment
              </label>
              <input
                type="text"
                placeholder="Enter UTR/Transaction ID"
                value={utr}
                onChange={e => setUtr(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          )}

          {/* Error/Success Message */}
          {error && (
            <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-center border border-red-400/30">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-center border border-green-400/30">
              {success}
            </div>
          )}
        </div>

        {/* Action Buttons (sticky at bottom) */}
        <div className="flex space-x-3 mt-6 sticky bottom-0 bg-white/10 pt-4 pb-2 z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-500 text-gray-300 rounded-xl hover:bg-gray-500/20 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !amount || amount < 50 || !utr}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              loading || !amount || amount < 50 || !utr
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-lg hover:shadow-green-500/25'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit UTR'
            )}
          </button>
        </div>

        {/* Terms */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Your request will be approved by admin after verification.
        </div>
      </div>
    </div>
  );
};

export default AddMoneyModal; 