import React, { useEffect, useState } from 'react';
import { apiCall } from '../../utils/api';

const Rounds = () => {
  const [rounds, setRounds] = useState([]);
  const [openRound, setOpenRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [winningNumber, setWinningNumber] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [announcing, setAnnouncing] = useState(false);

  useEffect(() => {
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
    // Fetch open round
    apiCall('/api/admin/bets', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => {
        if (data.bets && data.bets.length > 0) {
          setOpenRound(data.bets[0].round || null);
          setCurrentRound(data.bets[0].round || null);
        }
      });
  }, []);

  const handleAnnounce = (e) => {
    e.preventDefault();
    setAnnounceMsg('');
    setAnnouncing(true);
    apiCall('/api/admin/announce', {
      method: 'POST',
      body: JSON.stringify({ winningNumber }),
    })
      .then(data => {
        setAnnounceMsg(data.message || 'Result announced');
        setAnnouncing(false);
      })
      .catch(() => {
        setAnnounceMsg('Failed to announce result');
        setAnnouncing(false);
      });
  };

  const createNewRound = () => {
    setLoading(true);
    apiCall('/api/admin/create-round', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => {
        // Refresh the rounds data
        apiCall('/api/admin/rounds', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(data => {
            setRounds(data.rounds || []);
            setLoading(false);
          });
        
        // Refresh current round data
        apiCall('/api/admin/bets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(data => {
            if (data.bets && data.bets.length > 0) {
              setOpenRound(data.bets[0].round || null);
              setCurrentRound(data.bets[0].round || null);
            }
          });
      })
      .catch(() => {
        setError('Failed to create new round');
        setLoading(false);
      });
  };

  const announceResult = () => {
    if (!winningNumber || winningNumber === '') {
      setAnnounceMsg('Please enter a winning number');
      return;
    }
    
    const number = parseInt(winningNumber);
    if (isNaN(number) || number < 0 || number > 9) {
      setAnnounceMsg('Please enter a valid number between 0 and 9');
      return;
    }
    
    setAnnouncing(true);
    setAnnounceMsg('');
    
    apiCall('/api/admin/announce', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ winningNumber: number }),
    })
      .then(data => {
        setAnnounceMsg(data.message || 'Result announced successfully');
        setShowAnnounceModal(false);
        setWinningNumber('');
        setAnnouncing(false);
        
        // Refresh the rounds data
        apiCall('/api/admin/rounds', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(data => {
            setRounds(data.rounds || []);
          });
        
        // Refresh current round data
        apiCall('/api/admin/bets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(data => {
            if (data.bets && data.bets.length > 0) {
              setOpenRound(data.bets[0].round || null);
              setCurrentRound(data.bets[0].round || null);
            }
          });
      })
      .catch((error) => {
        setAnnounceMsg(error.message || 'Failed to announce result');
        setAnnouncing(false);
      });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">Round Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={createNewRound}
            disabled={loading}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
          >
            Create New Round
          </button>
          <button
            onClick={() => setShowAnnounceModal(true)}
            disabled={loading || !currentRound}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
          >
            Announce Result
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {announceMsg && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
          announceMsg.includes('successfully') || announceMsg.includes('announced') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {announceMsg}
        </div>
      )}

      {/* Current Round Info */}
      {currentRound && (
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6 border border-green-200">
          <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3 sm:mb-4">Current Active Round</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Round ID</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">#{currentRound.id}</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {currentRound.winningNumber !== null ? 'Completed' : 'Active'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Total Bets</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">₹{currentRound.totalBets || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Created</div>
              <div className="text-sm sm:text-base font-medium text-gray-900">
                {new Date(currentRound.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          {currentRound.winningNumber !== null && (
            <div className="mt-4 sm:mt-6 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Winning Number</div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto font-bold text-black text-2xl sm:text-3xl">
                  {currentRound.winningNumber}
                </div>
              </div>
            </div>
          )}
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
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Round</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bets</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Payout</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rounds.map(round => (
                <tr key={round._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="text-sm sm:text-base font-medium text-gray-900">#{round.id}</div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {round.winningNumber !== null ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 mr-2">
                          Completed
                        </span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black text-xs sm:text-sm">
                          {round.winningNumber}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900">₹{round.totalBets || 0}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900">₹{round.totalPayout || 0}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    <span className={`font-medium ${(round.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{round.profit || 0}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500">
                    {new Date(round.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rounds.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No rounds found.
            </div>
          )}
        </div>
      )}

      {/* Announce Result Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Announce Result</h3>
            
            {/* Validation Message */}
            {announceMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                announceMsg.includes('successfully') || announceMsg.includes('announced') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {announceMsg}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Winning Number (0-9)
              </label>
              <input
                type="number"
                min="0"
                max="9"
                value={winningNumber}
                onChange={(e) => {
                  setWinningNumber(e.target.value);
                  setAnnounceMsg(''); // Clear any previous messages
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter winning number (0-9)"
                disabled={announcing}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter any number from 0 to 9 to announce as the winning number
              </p>
              
              {/* Admin info */}
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-medium mb-1">Admin Control:</p>
                <p className="text-xs text-green-700">
                  You can announce results at any time. Scheduled times (11:00 AM, 3:00 PM, 9:00 PM) are only for user reference.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={announceResult}
                disabled={!winningNumber || announcing}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
              >
                {announcing ? 'Announcing...' : 'Announce Result'}
              </button>
              <button
                onClick={() => {
                  setShowAnnounceModal(false);
                  setWinningNumber('');
                  setAnnounceMsg('');
                }}
                disabled={announcing}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
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

export default Rounds; 