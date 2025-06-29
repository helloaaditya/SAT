import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/api';

const WithdrawalRequests = ({ isOpen, onClose, token }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiCall('/api/payment/withdraw-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend now returns only user's requests, no filtering needed
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'approved':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Pending';
      case 'approved':
        return '✅ Approved';
      case 'rejected':
        return '❌ Rejected';
      case 'completed':
        return '🎉 Completed';
      default:
        return '❓ Unknown';
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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-4xl w-full text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-400">💰 Withdrawal Requests</h2>
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
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center p-4">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-center text-gray-400 p-8">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-xl font-semibold mb-2">No Withdrawal Requests</div>
              <div className="text-sm">You haven't made any withdrawal requests yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left side - Request details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            ₹{request.amount}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(request.createdAt)}
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Account Holder:</span>
                          <span className="ml-2 font-semibold">{request.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Account Number:</span>
                          <span className="ml-2 font-mono">{request.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">IFSC Code:</span>
                          <span className="ml-2 font-mono">{request.ifsc}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Request ID:</span>
                          <span className="ml-2 font-mono text-xs">{request._id}</span>
                        </div>
                      </div>

                      {/* Admin Note */}
                      {request.adminNote && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                          <div className="text-xs text-blue-400 font-semibold mb-1">Admin Note:</div>
                          <div className="text-sm text-blue-300">{request.adminNote}</div>
                        </div>
                      )}

                      {/* Updated time if different from created */}
                      {request.updatedAt !== request.createdAt && (
                        <div className="mt-2 text-xs text-gray-400">
                          Last updated: {formatDate(request.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequests; 