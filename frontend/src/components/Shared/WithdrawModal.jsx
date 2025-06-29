import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/api';

const WithdrawModal = ({ isOpen, onClose, currentBalance }) => {
  const [form, setForm] = useState({ name: '', accountNumber: '', reAccountNumber: '', ifsc: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    apiCall('/api/payment/withdraw-requests', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(data => setRequests(data.requests || []));
  }, [isOpen]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    apiCall('/api/payment/withdraw-request', {
      method: 'POST',
      body: JSON.stringify(form),
    })
      .then(data => {
        if (data.success) {
          setMessage('Withdraw request submitted!');
          setForm({ name: '', accountNumber: '', reAccountNumber: '', ifsc: '', amount: '' });
        } else {
          setMessage(data.message || 'Failed to submit request');
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage('Network error');
        setLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl">×</button>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Withdraw Funds</h2>
        <div className="mb-4 text-sm text-gray-700 bg-yellow-100 p-3 rounded">
          Payouts are processed in <b>1-2 days</b>. You will be notified once approved.<br/>
          Minimum ₹200. Please double-check your bank details.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Account Holder Name" className="w-full px-4 py-2 border rounded text-black" required />
          <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account Number" className="w-full px-4 py-2 border rounded text-black" required />
          <input name="reAccountNumber" value={form.reAccountNumber} onChange={handleChange} placeholder="Re-enter Account Number" className="w-full px-4 py-2 border rounded text-black" required />
          <input name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="IFSC Code" className="w-full px-4 py-2 border rounded text-black" required />
          <input name="amount" type="number" min="200" max={currentBalance} value={form.amount} onChange={handleChange} placeholder="Amount (₹)" className="w-full px-4 py-2 border rounded text-black" required />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-2">
            {loading ? 'Submitting...' : 'Submit Withdraw Request'}
          </button>
        </form>
        {message && <div className="mt-4 text-center text-blue-700 font-semibold">{message}</div>}
        <div className="mt-8">
          <h3 className="font-bold mb-2">Your Withdraw Requests</h3>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>₹{r.amount}</td>
                    <td>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</td>
                  </tr>
                ))}
                {requests.length === 0 && <tr><td colSpan={3} className="text-center text-gray-400">No requests yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal; 