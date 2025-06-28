import React, { useState } from 'react';

const OtpInput = ({ mobile, onLogin, demoOtp }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 max-w-xs mx-auto mt-10">
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        className="border p-2 rounded"
        required
        pattern="[0-9]{6}"
      />
      <button type="submit" className="bg-green-600 text-white p-2 rounded" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      {demoOtp && <div className="text-xs text-gray-500">Demo OTP: {demoOtp}</div>}
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
};

export default OtpInput; 