import React, { useEffect, useState } from 'react';

const Bets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/bet/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setBets(data.bets || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load bets');
        setLoading(false);
      });
    // Fetch current round bet stats
    fetch('/api/admin/current-round-bet-stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bet Management</h2>
      {stats && (
        <div className="mb-8 p-4 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg font-bold mb-2 text-yellow-400">Current Round Stats</h3>
          <div className="mb-2">Total Bets: <span className="font-bold">₹{stats.totalBets}</span></div>
          <div className="mb-2">Number with Minimum Bet: <span className="font-bold text-blue-400">{stats.minNumber || '-'}</span> (₹{stats.minNumberTotal})</div>
          <div className="mb-2">Potential Payout (if {stats.minNumber} wins): <span className="font-bold text-green-400">₹{stats.potentialPayout}</span></div>
          <div className="mb-2">Profit (if {stats.minNumber} wins): <span className={`font-bold ${stats.profitIfMinWins >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{stats.profitIfMinWins}</span></div>
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Bets by Number:</h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(stats.betsByNumber || {}).map(([num, amt]) => (
                <div key={num} className={`p-2 rounded bg-white/5 ${num === stats.minNumber ? 'border border-blue-400' : 'border border-white/10'}`}>
                  <span className="font-bold">{num}</span>: ₹{amt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Mobile</th>
                <th className="px-4 py-2">Round</th>
                <th className="px-4 py-2">Number</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Payout</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {bets.map(bet => (
                <tr key={bet._id}>
                  <td className="px-4 py-2">{bet.user?.name || '-'}</td>
                  <td className="px-4 py-2">{bet.user?.mobile || '-'}</td>
                  <td className="px-4 py-2">{bet.round?.winningNumber ? `#${bet.round.winningNumber}` : (bet.round?._id || '-')}</td>
                  <td className="px-4 py-2">{bet.number}</td>
                  <td className="px-4 py-2">₹{bet.amount}</td>
                  <td className="px-4 py-2">{bet.result}</td>
                  <td className="px-4 py-2">₹{bet.payout}</td>
                  <td className="px-4 py-2">{new Date(bet.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bets.length === 0 && <div className="text-gray-500 mt-4">No bets found.</div>}
        </div>
      )}
    </div>
  );
};

export default Bets; 