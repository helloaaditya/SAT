import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/api';

const PaymentHistory = ({ isOpen, onClose, token }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
    }
  }, [isOpen, page]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiCall(`/api/payment/history?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPayments(data.payments);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-4xl w-full text-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-400">💰 Payment History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="ml-3 text-gray-300">Loading payment history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">⚠️</div>
              <div className="text-red-400">{error}</div>
              <button
                onClick={fetchPaymentHistory}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <div className="text-gray-400 text-lg">No payment history found</div>
              <div className="text-gray-500 text-sm mt-2">Your payment transactions will appear here</div>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment._id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">₹</span>
                      </div>
                      <div>
                        <div className="font-semibold">₹{payment.amount}</div>
                        <div className="text-sm text-gray-400">
                          {payment.transaction_id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Gateway</div>
                      <div className="font-semibold text-blue-400">{payment.gateway}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Currency</div>
                      <div className="font-semibold">{payment.currency}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Created</div>
                      <div className="font-semibold">{formatDate(payment.created_at)}</div>
                    </div>
                    {payment.processed_at && (
                      <div>
                        <div className="text-gray-400">Processed</div>
                        <div className="font-semibold">{formatDate(payment.processed_at)}</div>
                      </div>
                    )}
                  </div>

                  {payment.description && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-sm text-gray-400">{payment.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-lg transition-colors ${
                page === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Previous
            </button>
            
            <span className="text-gray-300">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-lg transition-colors ${
                page === totalPages
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <div className="text-xs text-gray-400">
            All payments are processed securely through PayCash Wallet
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory; 