import React, { useEffect, useState } from 'react';

const PlatformControls = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cleanMsg, setCleanMsg] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [actionMsg, setActionMsg] = useState('');
  const [note, setNote] = useState({});

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load stats');
        setLoading(false);
      });
  };

  const fetchWithdrawals = () => {
    fetch('/api/payment/withdraw-requests', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setWithdrawals(data.requests || []));
  };

  useEffect(() => {
    fetchStats();
    fetchWithdrawals();
  }, []);

  const handleClean = () => {
    setCleanMsg('');
    fetch('/api/bet/clean-invalid', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setCleanMsg(data.message || 'Cleaned');
        fetchStats();
      })
      .catch(() => setCleanMsg('Failed to clean invalid bets'));
  };

  const handleAction = (id, action) => {
    setActionMsg('');
    fetch(`/api/payment/withdraw-requests/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ adminNote: note[id] || '' }),
    })
      .then(res => res.json())
      .then(data => {
        setActionMsg(data.message || `${action}d`);
        fetchWithdrawals();
      })
      .catch(() => setActionMsg('Failed to process request'));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Platform Controls</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {stats && (
            <div className="mb-6 space-y-2">
              <div>Total Users: <span className="font-bold">{stats.totalUsers}</span></div>
              <div>Total Bets: <span className="font-bold">{stats.totalBets}</span></div>
              <div>Total Profit: <span className="font-bold text-green-600">₹{stats.totalProfit}</span></div>
            </div>
          )}
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleClean}>
            Clean Invalid Bets
          </button>
          {cleanMsg && <div className="text-green-600 mt-2">{cleanMsg}</div>}
        </>
      )}
      {/* Payouts Section */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4 text-blue-700">Payouts (Withdraw Requests)</h3>
        <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-400/10 to-blue-600/10 text-blue-300">
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Account</th>
                <th className="py-2 px-3">IFSC</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(req => (
                <tr key={req._id}>
                  <td>{req.user?.name || '-'}</td>
                  <td>₹{req.amount}</td>
                  <td>{req.accountNumber}</td>
                  <td>{req.ifsc}</td>
                  <td>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    {req.status === 'pending' && (
                      <div className="flex flex-col space-y-2">
                        <input
                          type="text"
                          placeholder="Admin note (optional)"
                          value={note[req._id] || ''}
                          onChange={e => setNote({ ...note, [req._id]: e.target.value })}
                          className="border px-2 py-1 rounded mb-1"
                        />
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded mb-1"
                          onClick={() => handleAction(req._id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded"
                          onClick={() => handleAction(req._id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status !== 'pending' && <span className="text-gray-500">-</span>}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400">No withdraw requests.</td></tr>}
            </tbody>
          </table>
          {actionMsg && <div className="text-green-600 mt-2">{actionMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default PlatformControls; 