import React, { useState } from 'react';

const MobileInput = ({ onOtpSent }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok) {
        onOtpSent(mobile, data.otp); // Pass OTP for demo
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSendOtp} className="flex flex-col gap-4 max-w-xs mx-auto mt-10">
      <input
        type="tel"
        placeholder="Enter mobile number"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        className="border p-2 rounded"
        required
        pattern="[0-9]{10,15}"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
};

export default MobileInput; 