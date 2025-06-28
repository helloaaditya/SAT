import React, { useEffect, useState } from 'react';
import Loader from '../components/Shared/Loader';

const Results = ({ user, token }) => {
  const [results, setResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ date: '', round: '' });
  const [error, setError] = useState('');

  // Fetch all results
  useEffect(() => {
    setLoading(true);
    fetch('/api/bet/results')
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load results');
        setLoading(false);
      });
  }, []);

  // Fetch user's own results
  useEffect(() => {
    if (!token) return;
    fetch('/api/bet/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUserResults(data.bets || []));
  }, [token]);

  // Filtered results
  const filteredResults = results.filter(r => {
    const matchDate = filter.date ? r.date?.slice(0, 10) === filter.date : true;
    const matchRound = filter.round ? r.round?.toString() === filter.round : true;
    return matchDate && matchRound;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">📊 Results</h1>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
          <input
            type="date"
            value={filter.date}
            onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            min="1"
            placeholder="Round #"
            value={filter.round}
            onChange={e => setFilter(f => ({ ...f, round: e.target.value }))}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={() => setFilter({ date: '', round: '' })}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-all"
          >
            Clear Filters
          </button>
        </div>
        {/* Loader */}
        {loading ? <Loader /> : null}
        {/* Error */}
        {error && <div className="text-center text-red-400 mb-6">{error}</div>}
        {/* Results Table */}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 text-yellow-300">
                  <th className="py-3 px-4 text-left">Round</th>
                  <th className="py-3 px-4 text-left">Winning Number</th>
                  <th className="py-3 px-4 text-left">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">No results found.</td>
                  </tr>
                ) : filteredResults.map(r => (
                  <tr key={r._id} className="border-b border-white/10 hover:bg-white/10 transition-all">
                    <td className="py-3 px-4 font-bold">
                      {r.winningNumber
                        ? `#${r.winningNumber}`
                        : r.date
                          ? new Date(r.date).toLocaleDateString()
                          : '-'}
                    </td>
                    <td className="py-3 px-4 text-yellow-400 text-lg font-bold">{r.winningNumber}</td>
                    <td className="py-3 px-4">{r.date ? new Date(r.date).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* User's Own Results */}
        {user && userResults.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Your Bets & Results</h2>
            <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-green-400/10 to-green-600/10 text-green-300">
                    <th className="py-3 px-4 text-left">Round</th>
                    <th className="py-3 px-4 text-left">Your Number</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Result</th>
                    <th className="py-3 px-4 text-left">Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {userResults.map(bet => (
                    <tr key={bet._id} className="border-b border-white/10 hover:bg-white/10 transition-all">
                      <td className="py-3 px-4 font-bold">
                        {bet.round?.winningNumber
                          ? `#${bet.round.winningNumber}`
                          : bet.result === 'pending'
                            ? 'Pending'
                            : '-'}
                      </td>
                      <td className="py-3 px-4">{bet.number}</td>
                      <td className="py-3 px-4">₹{bet.amount}</td>
                      <td className={`py-3 px-4 font-bold ${bet.result === 'win' ? 'text-green-400' : bet.result === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{bet.result.charAt(0).toUpperCase() + bet.result.slice(1)}</td>
                      <td className="py-3 px-4">{bet.createdAt ? new Date(bet.createdAt).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results; 