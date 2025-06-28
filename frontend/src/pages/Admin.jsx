import React, { useState, useEffect } from 'react';
import Users from '../components/Admin/Users';
import Bets from '../components/Admin/Bets';
import Rounds from '../components/Admin/Rounds';
import UPIRequests from '../components/Admin/UPIRequests';
import PlatformControls from '../components/Admin/PlatformControls';

const sections = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'bets', label: 'Bets' },
  { key: 'rounds', label: 'Rounds' },
  { key: 'upi', label: 'UPI Requests' },
  { key: 'platform', label: 'Platform Controls' },
];

const Admin = () => {
  const [active, setActive] = useState('dashboard');
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultReminder, setResultReminder] = useState(null);

  // Fetch result reminder status
  useEffect(() => {
    const fetchResultReminder = async () => {
      try {
        const res = await fetch('/api/admin/result-reminder', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResultReminder(data);
        }
      } catch (err) {
        console.error('Failed to fetch result reminder:', err);
      }
    };

    fetchResultReminder();
    const interval = setInterval(fetchResultReminder, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (active === 'dashboard') {
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
    }
  }, [active]);

  function formatTime(dt) {
    if (!dt) return '';
    let h = dt.getHours();
    const m = dt.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Result Announcement Notifications */}
      {resultReminder && (resultReminder.shouldAnnounce || resultReminder.isResultTime) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg border-2 ${
            resultReminder.isResultTime 
              ? 'bg-red-500 text-white border-red-300 animate-pulse' 
              : 'bg-yellow-500 text-black border-yellow-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">
                  {resultReminder.isResultTime ? '🚨 RESULT TIME!' : '⏰ Result Announcement Soon'}
                </div>
                <div className="text-sm mt-1">
                  {resultReminder.isResultTime 
                    ? 'It\'s time to announce the result!' 
                    : `Next result at ${formatTime(new Date(resultReminder.nextResultTime))} (in ${resultReminder.minutesUntilResult} minutes)`
                  }
                </div>
              </div>
              <button 
                onClick={() => setResultReminder(null)}
                className="text-lg font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
            {resultReminder.isResultTime && (
              <div className="mt-2 text-sm">
                Go to <strong>Rounds</strong> section to announce the winning number!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="h-20 flex items-center justify-center border-b">
          <span className="text-xl font-bold text-blue-600">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4">
          {sections.map(s => (
            <button
              key={s.key}
              className={`w-full text-left px-6 py-3 hover:bg-blue-50 focus:outline-none ${active === s.key ? 'bg-blue-100 font-semibold text-blue-700' : 'text-gray-700'}`}
              onClick={() => setActive(s.key)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {active === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Winning Number</th>
                      <th className="px-4 py-2">Total Bets</th>
                      <th className="px-4 py-2">Total Payout</th>
                      <th className="px-4 py-2">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2 font-bold">{r.winningNumber}</td>
                        <td className="px-4 py-2">₹{r.totalBets}</td>
                        <td className="px-4 py-2">₹{r.totalPayout}</td>
                        <td className={`px-4 py-2 font-semibold ${r.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{r.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rounds.length === 0 && <div className="text-gray-500 mt-4">No rounds found.</div>}
              </div>
            )}
          </div>
        )}
        {active === 'users' && <Users />}
        {active === 'bets' && <Bets />}
        {active === 'rounds' && <Rounds />}
        {active === 'upi' && <UPIRequests />}
        {active === 'platform' && <PlatformControls />}
      </main>
    </div>
  );
};

export default Admin; 