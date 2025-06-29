import React, { useEffect, useState } from 'react';
import { apiCall } from '../../utils/api';

const UPIRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [note, setNote] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    apiCall('/api/payment/upi-requests', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load UPI requests');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = (id, action) => {
    setActionMsg('');
    apiCall(`/api/payment/upi-requests/${id}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ adminNote: note[id] || '' }),
    })
      .then(data => {
        setActionMsg(data.message || `${action}d`);
        fetchRequests();
      })
      .catch(() => setActionMsg('Failed to process request'));
  };

  const handleStatusChange = (id, status) => {
    setSelectedRequest(id);
    setSelectedAction(status);
    setShowStatusModal(true);
    setAdminNotes('');
  };

  const confirmStatusChange = () => {
    if (!selectedRequest) return;
    
    setUpdating(true);
    apiCall(`/api/payment/upi-requests/${selectedRequest}/${selectedAction}`, {
      method: 'POST',
      body: JSON.stringify({ adminNote: adminNotes }),
    })
      .then(data => {
        setActionMsg(data.message || `${selectedAction}d`);
        fetchRequests();
        setShowStatusModal(false);
        setUpdating(false);
        setSelectedRequest(null);
        setSelectedAction('');
      })
      .catch(() => {
        setActionMsg('Failed to process request');
        setUpdating(false);
      });
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">UPI Payment Requests</h2>
      
      {actionMsg && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
          actionMsg.includes('Failed') 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {actionMsg}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 text-sm sm:text-base">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map(request => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {request.user?.name ? request.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm sm:text-base font-medium text-gray-900">{request.user?.name || 'Anonymous'}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{request.user?.mobile || request.user?.email || 'No contact'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-900">
                    ₹{request.amount}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900">
                    {request.upiId}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : request.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {request.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleStatusChange(request._id, 'approve')}
                          className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(request._id, 'reject')}
                          className="px-2 sm:px-3 py-1 sm:py-2 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No UPI payment requests found.
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Update Request Status</h3>
            <div className="mb-4">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                rows="3"
                placeholder="Add notes for the user..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={confirmStatusChange}
                disabled={updating}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedRequest(null);
                  setSelectedAction('');
                }}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm sm:text-base font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UPIRequests; 