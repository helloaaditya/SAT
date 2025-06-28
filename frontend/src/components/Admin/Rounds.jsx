import React, { useEffect, useState } from 'react';

const Rounds = () => {
  const [rounds, setRounds] = useState([]);
  const [openRound, setOpenRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [winningNumber, setWinningNumber] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/rounds', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setRounds(data.rounds || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load rounds');
        setLoading(false);
      });
    // Fetch open round
    fetch('/api/admin/bets', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.bets && data.bets.length > 0) {
          setOpenRound(data.bets[0].round || null);
        }
      });
  }, []);

  const handleAnnounce = (e) => {
    e.preventDefault();
    setAnnounceMsg('');
    fetch('/api/admin/announce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ winningNumber }),
    })
      .then(res => res.json())
      .then(data => {
        setAnnounceMsg(data.message || 'Result announced');
      })
      .catch(() => setAnnounceMsg('Failed to announce result'));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Round Management</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {openRound && (
            <form onSubmit={handleAnnounce} className="mb-6 flex items-center space-x-4">
              <input
                type="number"
                min="0"
                max="99"
                value={winningNumber}
                onChange={e => setWinningNumber(e.target.value)}
                className="border px-3 py-2 rounded"
                placeholder="Winning Number"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Announce Result</button>
              {announceMsg && <span className="ml-4 text-green-600">{announceMsg}</span>}
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Winning Number</th>
                  <th className="px-4 py-2">Created At</th>
                  <th className="px-4 py-2">Total Bets</th>
                  <th className="px-4 py-2">Total Payout</th>
                  <th className="px-4 py-2">Profit</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2 font-bold">{r.winningNumber}</td>
                    <td className="px-4 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">₹{r.totalBets}</td>
                    <td className="px-4 py-2">₹{r.totalPayout}</td>
                    <td className={`px-4 py-2 font-semibold ${r.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{r.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rounds.length === 0 && <div className="text-gray-500 mt-4">No rounds found.</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default Rounds; 