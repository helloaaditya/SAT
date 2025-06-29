import React, { useEffect, useState } from 'react';
import { apiCall } from '../../utils/api';

const Bets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [betsByNumber, setBetsByNumber] = useState({});
  const [profitAnalysis, setProfitAnalysis] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiCall('/api/bet/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => {
        setBets(data.bets || []);
        setLoading(false);
        
        // Calculate bets by number
        const betsByNum = {};
        data.bets?.forEach(bet => {
          if (bet.result === 'pending') {
            if (!betsByNum[bet.number]) {
              betsByNum[bet.number] = { count: 0, totalAmount: 0 };
            }
            betsByNum[bet.number].count++;
            betsByNum[bet.number].totalAmount += bet.amount;
          }
        });
        setBetsByNumber(betsByNum);
        
        // Calculate profit analysis
        const totalRevenue = data.bets?.reduce((sum, bet) => 
          bet.result === 'pending' ? sum + bet.amount : sum, 0) || 0;
        
        const analysis = Object.entries(betsByNum).map(([number, data]) => {
          const payoutForThisNumber = data.totalAmount * 10; // 10x multiplier for winning bets on this number
          const profit = totalRevenue - payoutForThisNumber; // Total revenue - payout for this specific number
          return {
            number: parseInt(number),
            totalBets: data.count,
            totalAmount: data.totalAmount,
            potentialPayout: payoutForThisNumber,
            profit,
            profitPercentage: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0
          };
        }).sort((a, b) => b.profit - a.profit); // Sort by profit (highest first)
        
        setProfitAnalysis(analysis);
      })
      .catch(() => {
        setError('Failed to load bets');
        setLoading(false);
      });
    // Fetch current round bet stats
    apiCall('/api/admin/current-round-bet-stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => setStats(data));
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Bet Management</h2>
      
      {/* Current Round Stats */}
      {stats && (
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3 sm:mb-4">Current Round Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Total Bets</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.totalBets || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-lg sm:text-xl font-bold text-green-600">₹{stats.totalAmount || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.activeUsers || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="text-sm text-gray-600">Round ID</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.roundId || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Profit Analysis */}
      {profitAnalysis && profitAnalysis.length > 0 && (
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6 border border-green-200">
          <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3 sm:mb-4">Profit Analysis - Which Number to Win?</h3>
          
          {/* Summary */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
            <div className="text-sm sm:text-base text-gray-700 mb-2">
              <strong>Total Revenue:</strong> ₹{profitAnalysis.reduce((sum, a) => sum + a.totalAmount, 0).toLocaleString()} 
              <br />
              <strong>Calculation:</strong> For each number, profit = Total Revenue - (Number's bets × 10)
              <br />
              <strong>Best Choice:</strong> Number {profitAnalysis[0]?.number} with ₹{profitAnalysis[0]?.profit?.toLocaleString() || 0} profit
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {profitAnalysis.slice(0, 3).map((analysis, index) => (
              <div key={analysis.number} className={`bg-white rounded-lg p-3 sm:p-4 shadow-sm border-2 ${
                index === 0 ? 'border-green-500' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Number {analysis.number}</div>
                  {index === 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      BEST CHOICE
                    </span>
                  )}
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  ₹{analysis.profit.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  {analysis.profitPercentage}% profit margin
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {analysis.totalBets} bets • ₹{analysis.totalAmount} total • ₹{analysis.potentialPayout} payout
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 sm:mt-6">
            <h4 className="text-sm sm:text-base font-semibold text-green-800 mb-2">All Numbers Breakdown:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {profitAnalysis.map((analysis) => (
                <div key={analysis.number} className="bg-white rounded-lg p-2 sm:p-3 shadow-sm text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-black text-sm sm:text-base">
                    {analysis.number}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">₹{analysis.profit.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{analysis.totalBets} bets</div>
                </div>
              ))}
            </div>
          </div>
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
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Potential Win</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bets.map(bet => (
                <tr key={bet._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {bet.user?.name ? bet.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm sm:text-base font-medium text-gray-900">{bet.user?.name || 'Anonymous'}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{bet.user?.mobile || bet.user?.email || 'No contact'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black text-sm sm:text-base">
                      {bet.number}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-900">
                    ₹{bet.amount}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-green-600">
                    ₹{Math.floor(bet.amount * 10)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      bet.result === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : bet.result === 'win' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bet.result.charAt(0).toUpperCase() + bet.result.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500">
                    {new Date(bet.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bets.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No bets found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bets; 