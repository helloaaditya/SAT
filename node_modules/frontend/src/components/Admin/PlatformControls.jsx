import React, { useEffect, useState } from 'react';
import { apiCall } from '../../utils/api';

const PlatformControls = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cleanMsg, setCleanMsg] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [actionMsg, setActionMsg] = useState('');
  const [note, setNote] = useState({});
  
  // Add missing state variables
  const [formData, setFormData] = useState({
    isActive: true,
    minBet: 10,
    maxBet: 10000,
    payoutMultiplier: 10
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = () => {
    setLoading(true);
    apiCall('/api/admin/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => {
        setStats(data);
        // Initialize form data with current stats
        if (data.platformStatus) {
          setFormData({
            isActive: data.platformStatus.isActive || true,
            minBet: data.platformStatus.minBet || 10,
            maxBet: data.platformStatus.maxBet || 10000,
            payoutMultiplier: data.platformStatus.payoutMultiplier || 10
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load stats');
        setLoading(false);
      });
  };

  const fetchWithdrawals = () => {
    apiCall('/api/payment/withdraw-requests', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => setWithdrawals(data.requests || []));
  };

  useEffect(() => {
    fetchStats();
    fetchWithdrawals();
  }, []);

  const handleClean = () => {
    setCleanMsg('');
    setUpdating(true);
    
    apiCall('/api/bet/clean-invalid', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => {
        setCleanMsg(data.message || 'Invalid bets cleaned successfully');
        fetchStats();
        setUpdating(false);
      })
      .catch((error) => {
        setCleanMsg(error.message || 'Failed to clean invalid bets');
        setUpdating(false);
      });
  };

  const handleAction = (id, action) => {
    setActionMsg('');
    setUpdating(true);
    
    apiCall(`/api/payment/withdraw-requests/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ adminNote: note[id] || '' }),
    })
      .then(data => {
        setActionMsg(data.message || `Request ${action}d successfully`);
        fetchWithdrawals();
        setUpdating(false);
      })
      .catch((error) => {
        setActionMsg(error.message || 'Failed to process request');
        setUpdating(false);
      });
  };

  // Add missing functions
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.minBet < 0) {
      setMessage('Minimum bet cannot be negative');
      return;
    }
    if (formData.maxBet < formData.minBet) {
      setMessage('Maximum bet must be greater than minimum bet');
      return;
    }
    if (formData.payoutMultiplier <= 0) {
      setMessage('Payout multiplier must be greater than 0');
      return;
    }
    
    setUpdating(true);
    setMessage('');
    
    apiCall('/api/admin/update-settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(formData),
    })
      .then(data => {
        setMessage(data.message || 'Settings updated successfully');
        fetchStats();
        setUpdating(false);
      })
      .catch((error) => {
        setMessage(error.message || 'Failed to update settings');
        setUpdating(false);
      });
  };

  const resetForm = () => {
    if (stats?.platformStatus) {
      setFormData({
        isActive: stats.platformStatus.isActive || true,
        minBet: stats.platformStatus.minBet || 10,
        maxBet: stats.platformStatus.maxBet || 10000,
        payoutMultiplier: stats.platformStatus.payoutMultiplier || 10
      });
    }
    setMessage('');
  };

  const handleQuickAction = (action) => {
    setUpdating(true);
    setMessage('');
    
    let actionData = {};
    
    switch (action) {
      case 'activate':
        actionData = { isActive: true };
        break;
      case 'deactivate':
        actionData = { isActive: false };
        break;
      case 'reset':
        actionData = {
          isActive: true,
          minBet: 10,
          maxBet: 10000,
          payoutMultiplier: 10
        };
        break;
      default:
        setMessage('Invalid action');
        setUpdating(false);
        return;
    }
    
    apiCall('/api/admin/update-settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(actionData),
    })
      .then(data => {
        setMessage(data.message || `Platform ${action}d successfully`);
        fetchStats();
        setUpdating(false);
      })
      .catch((error) => {
        setMessage(error.message || `Failed to ${action} platform`);
        setUpdating(false);
      });
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Platform Controls</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 text-sm sm:text-base">{error}</div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Financial Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Financial Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-6 border border-green-200">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  ₹{stats?.totalRevenue?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">All time earnings</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
                <div className="text-sm text-gray-600">Total Payouts</div>
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  ₹{stats?.totalPayouts?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Winning bets paid</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 border border-purple-200">
                <div className="text-sm text-gray-600">Total Profit</div>
                <div className={`text-lg sm:text-xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{stats?.totalProfit?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Revenue - Payouts</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 sm:p-6 border border-orange-200">
                <div className="text-sm text-gray-600">Profit Margin</div>
                <div className={`text-lg sm:text-xl font-bold ${(stats?.profitMargin || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats?.profitMargin?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Profit percentage</div>
              </div>
            </div>
          </div>

          {/* Platform Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Platform Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Platform</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      {stats?.platformStatus?.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${stats?.platformStatus?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Minimum Bet</div>
                <div className="text-lg sm:text-xl font-bold text-blue-600">₹{stats?.platformStatus?.minBet || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Maximum Bet</div>
                <div className="text-lg sm:text-xl font-bold text-green-600">₹{stats?.platformStatus?.maxBet || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Payout Multiplier</div>
                <div className="text-lg sm:text-xl font-bold text-purple-600">{stats?.platformStatus?.payoutMultiplier || 0}x</div>
              </div>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Platform Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-lg sm:text-xl font-bold text-indigo-600">{stats?.totalUsers || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Total Bets</div>
                <div className="text-lg sm:text-xl font-bold text-cyan-600">{stats?.totalBets || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Active Rounds</div>
                <div className="text-lg sm:text-xl font-bold text-orange-600">{stats?.activeRounds || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-sm text-gray-600">Completed Rounds</div>
                <div className="text-lg sm:text-xl font-bold text-teal-600">{stats?.completedRounds || 0}</div>
              </div>
            </div>
          </div>

          {/* Platform Settings Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Update Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Platform Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Minimum Bet (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minBet}
                    onChange={(e) => setFormData({ ...formData, minBet: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Maximum Bet (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxBet}
                    onChange={(e) => setFormData({ ...formData, maxBet: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Payout Multiplier
                  </label>
                  <input
                    type="number"
                    value={formData.payoutMultiplier}
                    onChange={(e) => setFormData({ ...formData, payoutMultiplier: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Settings'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm sm:text-base font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
            {message && (
              <div className={`mt-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
            </div>
          )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => handleQuickAction('activate')}
                disabled={updating}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
              >
                Activate Platform
              </button>
              <button
                onClick={() => handleQuickAction('deactivate')}
                disabled={updating}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
              >
                Deactivate Platform
              </button>
              <button
                onClick={() => handleQuickAction('reset')}
                disabled={updating}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Maintenance Tools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Maintenance Tools</h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">Clean Invalid Bets</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Remove any corrupted or invalid bet records from the database</p>
                </div>
                <button
                  onClick={handleClean}
                  disabled={updating}
                  className="mt-2 sm:mt-0 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
                >
                  {updating ? 'Cleaning...' : 'Clean Invalid Bets'}
          </button>
              </div>
              {cleanMsg && (
                <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                  cleanMsg.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {cleanMsg}
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Requests */}
          {withdrawals.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Recent Withdrawal Requests</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
                  <tbody className="divide-y divide-gray-200">
                    {withdrawals.slice(0, 5).map(request => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div className="text-sm sm:text-base font-medium text-gray-900">{request.user?.name || 'Anonymous'}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{request.user?.mobile || 'No contact'}</div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-900">₹{request.amount}</td>
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
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                          {request.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                                onClick={() => handleAction(request._id, 'approve')}
                                className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                                onClick={() => handleAction(request._id, 'reject')}
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
              </div>
              {actionMsg && (
                <div className={`mt-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                  actionMsg.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {actionMsg}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformControls; 