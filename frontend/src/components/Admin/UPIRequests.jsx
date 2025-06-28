import React, { useEffect, useState } from 'react';

const UPIRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [note, setNote] = useState({});

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/payment/upi-requests', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
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
    fetch(`/api/payment/upi-requests/${id}/${action}`, {
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
        fetchRequests();
      })
      .catch(() => setActionMsg('Failed to process request'));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">UPI Requests</h2>
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
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">UTR</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td className="px-4 py-2">{req.user?.name || '-'}</td>
                  <td className="px-4 py-2">{req.user?.mobile || '-'}</td>
                  <td className="px-4 py-2">₹{req.amount}</td>
                  <td className="px-4 py-2">{req.utr}</td>
                  <td className="px-4 py-2">{req.status}</td>
                  <td className="px-4 py-2">{new Date(req.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
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
            </tbody>
          </table>
          {requests.length === 0 && <div className="text-gray-500 mt-4">No UPI requests found.</div>}
          {actionMsg && <div className="text-green-600 mt-2">{actionMsg}</div>}
        </div>
      )}
    </div>
  );
};

export default UPIRequests; 