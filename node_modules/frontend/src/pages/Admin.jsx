import React, { useState, useEffect } from 'react';
import Users from '../components/Admin/Users';
import Bets from '../components/Admin/Bets';
import Rounds from '../components/Admin/Rounds';
import UPIRequests from '../components/Admin/UPIRequests';
import PlatformControls from '../components/Admin/PlatformControls';
import { apiCall } from '../utils/api';

const sections = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'bets', label: 'Bets' },
  { key: 'rounds', label: 'Rounds' },
  { key: 'upi', label: 'UPI Requests' },
  { key: 'platform', label: 'Platform Controls' },
];

const Admin = () => {
  const [active, setActive] = useState('dashboard');
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultReminder, setResultReminder] = useState(null);

  // Fetch result reminder status
  useEffect(() => {
    const fetchResultReminder = async () => {
      try {
        const data = await apiCall('/api/admin/result-reminder', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setResultReminder(data);
      } catch (err) {
        // Handle error silently
      }
    };

    fetchResultReminder();
    const interval = setInterval(fetchResultReminder, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (active === 'dashboard') {
      setLoading(true);
      apiCall('/api/admin/rounds', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(data => {
          setRounds(data.rounds || []);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load rounds');
          setLoading(false);
        });
    }
  }, [active]);

  function formatTime(dt) {
    if (!dt) return '';
    let h = dt.getHours();
    const m = dt.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Result Announcement Notifications */}
      {resultReminder && resultReminder.needsAnnouncement && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 sm:p-4 text-center">
          <div className="text-sm sm:text-base font-semibold">
            ⚠️ Manual Result Announcement Required!
          </div>
          <div className="text-xs sm:text-sm mt-1">
            There is an open round waiting for manual result announcement. Go to Rounds section to announce the result.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your SattaWala platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-1 sm:space-x-8 min-w-max">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActive(section.key)}
                  className={`py-2 sm:py-4 px-3 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                    active === section.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {active === 'dashboard' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard Overview</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center p-4 text-sm sm:text-base">{error}</div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Current Round Info */}
                  {rounds.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                      <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3 sm:mb-4">Current Round</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="text-sm text-gray-600">Round ID</div>
                          <div className="text-lg sm:text-xl font-bold text-gray-900">{rounds[0].id || 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="text-sm text-gray-600">Status</div>
                          <div className="text-lg sm:text-xl font-bold text-green-600">
                            {rounds[0].winningNumber !== null ? 'Completed' : 'Active'}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="text-sm text-gray-600">Total Bets</div>
                          <div className="text-lg sm:text-xl font-bold text-blue-600">₹{rounds[0].totalBets || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="text-sm text-gray-600">Profit</div>
                          <div className={`text-lg sm:text-xl font-bold ${(rounds[0].profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{rounds[0].profit || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Rounds */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Recent Rounds</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Round</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Result</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Bets</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {rounds.slice(0, 5).map((round) => (
                            <tr key={round._id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-900">{round.id || 'N/A'}</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                                {round.winningNumber !== null ? (
                                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                                    {round.winningNumber}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900">₹{round.totalBets || 0}</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                                <span className={`font-medium ${(round.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ₹{round.profit || 0}
                                </span>
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500">
                                {formatTime(new Date(round.createdAt))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {active === 'users' && <Users />}
          {active === 'bets' && <Bets />}
          {active === 'rounds' && <Rounds />}
          {active === 'upi' && <UPIRequests />}
          {active === 'platform' && <PlatformControls />}
        </div>
      </div>
    </div>
  );
};

export default Admin; 