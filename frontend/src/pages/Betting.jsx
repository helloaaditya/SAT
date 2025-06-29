import React, { useState, useEffect } from 'react';
import AddMoneyModal from '../components/Shared/AddMoneyModal';
import WithdrawModal from '../components/Shared/WithdrawModal';
import WithdrawalRequests from '../components/Shared/WithdrawalRequests';
import { apiCall } from '../utils/api';

const Betting = ({ user, token }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState(user.balance);
  const [pendingBets, setPendingBets] = useState([]);
  const [betsLoading, setBetsLoading] = useState(true);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawalRequests, setShowWithdrawalRequests] = useState(false);
  const [nextResultTime, setNextResultTime] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Available numbers (1-20)
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
  
  // Available amounts with multipliers
  const amounts = [
    { value: 10, multiplier: 10.0 },
    { value: 25, multiplier: 10.0 },
    { value: 50, multiplier: 10.0 },
    { value: 100, multiplier: 10.0 },
    { value: 200, multiplier: 10.0 },
    { value: 300, multiplier: 10.0 },
    { value: 500, multiplier: 10.0 },
    { value: 750, multiplier: 10.0 },
    { value: 1000, multiplier: 10.0 }
  ];

  // Fetch next result time
  useEffect(() => {
    let timer;
    const fetchNextResultTime = async () => {
      try {
        const data = await apiCall('/api/bet/next-result-time');
        if (data.nextResultTime) {
          setNextResultTime(new Date(data.nextResultTime));
        }
      } catch {}
    };
    fetchNextResultTime();
    timer = setInterval(() => {
      setNextResultTime(prev => prev ? new Date(prev) : null); // force rerender
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update countdown
  useEffect(() => {
    if (!nextResultTime) return;
    const updateCountdown = () => {
      const now = new Date();
      const diff = nextResultTime - now;
      if (diff <= 0) {
        setCountdown('Result time!');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, [nextResultTime]);

  function formatTime(dt) {
    if (!dt) return '';
    let h = dt.getHours();
    const m = dt.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  // Calculate potential winnings
  const getPotentialWinnings = () => {
    if (!selectedAmount) return 0;
    const amount = amounts.find(a => a.value === selectedAmount);
    return amount ? Math.floor(selectedAmount * amount.multiplier) : 0;
  };

  // Fetch pending bets for current round
  useEffect(() => {
    const fetchPendingBets = async () => {
      setBetsLoading(true);
      try {
        const data = await apiCall('/api/bet/current');
        setPendingBets(data.bets || []);
      } catch (err) {
        setPendingBets([]);
      }
      setBetsLoading(false);
    };
    fetchPendingBets();
  }, [message]);

  const handleBet = async (e) => {
    e.preventDefault();
    if (!selectedNumber || !selectedAmount) {
      setMessage('Please select both a number and amount');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const data = await apiCall('/api/bet', {
        method: 'POST',
        body: JSON.stringify({ number: selectedNumber, amount: selectedAmount }),
      });
      setMessage('🎉 Bet placed successfully! Good luck!');
      setBalance(data.balance);
      setSelectedNumber(null);
      setSelectedAmount(null);
      // Refresh pending bets
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setMessage(err.message || 'Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleAddMoneySuccess = (newBalance) => {
    setBalance(newBalance);
    setShowAddMoneyModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            🎰 Place Your Bet
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg">Select your lucky number and amount to win big!</p>
          
          {/* Next Result Time - Prominent Display */}
          {nextResultTime && (
            <div className="mt-4 sm:mt-6 mb-4 flex justify-center">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg animate-pulse border-2 border-yellow-300 text-center">
                <div className="text-sm sm:text-lg font-bold">
                  ⏰ Next Result: {formatTime(nextResultTime)}
                </div>
                {countdown && (
                  <div className="text-xs sm:text-sm font-semibold text-yellow-200">
                    Hurry! Only {countdown} left to bet!
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              Balance: <span className="text-yellow-400">₹{balance}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowAddMoneyModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 sm:px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 text-sm sm:text-base"
              >
                💰 Add Money
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
              >
                🏦 Withdraw
              </button>
              <button
                onClick={() => setShowWithdrawalRequests(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
              >
                📋 Requests
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Betting Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Choose Your Bet</h2>
            
            {/* Number Selection */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-yellow-400">Select Your Lucky Number (1-20)</h3>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {numbers.map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedNumber(num)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm sm:text-lg transition-all duration-300 transform hover:scale-110 ${
                      selectedNumber === num
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/50'
                        : 'bg-white/20 hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-yellow-400">Select Bet Amount</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {amounts.map(amount => (
                  <button
                    key={amount.value}
                    onClick={() => setSelectedAmount(amount.value)}
                    className={`p-3 sm:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedAmount === amount.value
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="font-bold text-sm sm:text-lg">₹{amount.value}</div>
                    <div className="text-xs sm:text-sm text-gray-300">{amount.multiplier}x</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Winnings Display */}
            {selectedAmount && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30">
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-gray-300">Potential Winnings</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-400">
                    ₹{getPotentialWinnings()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {amounts.find(a => a.value === selectedAmount)?.multiplier}x multiplier
                  </div>
                </div>
              </div>
            )}

            {/* Place Bet Button */}
            <button
              onClick={handleBet}
              disabled={loading || !selectedNumber || !selectedAmount || selectedAmount > balance}
              className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                loading || !selectedNumber || !selectedAmount || selectedAmount > balance
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black hover:scale-105 shadow-lg hover:shadow-yellow-500/25'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Placing Bet...
                </span>
              ) : (
                `🎯 Place Bet - ₹${selectedAmount || 0}`
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`mt-3 sm:mt-4 p-3 rounded-lg text-center font-semibold text-sm sm:text-base ${
                message.includes('successfully') 
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-400/30'
              }`}>
                {message}
              </div>
            )}

            {/* Insufficient Balance Warning */}
            {selectedAmount && selectedAmount > balance && (
              <div className="mt-3 sm:mt-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-center border border-red-400/30 text-sm sm:text-base">
                ⚠️ Insufficient balance. Please add more funds.
              </div>
            )}
          </div>

          {/* Pending Bets Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Your Current Bets</h2>
            
            {betsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-yellow-400"></div>
                <span className="ml-2 text-gray-300 text-sm sm:text-base">Loading bets...</span>
              </div>
            ) : pendingBets.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎲</div>
                <div className="text-gray-400 text-base sm:text-lg">No active bets for this round</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-2">Place your first bet to get started!</div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {pendingBets.map(bet => (
                  <div key={bet._id} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black text-sm sm:text-base">
                          {bet.number}
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base">Number {bet.number}</div>
                          <div className="text-xs sm:text-sm text-gray-400">₹{bet.amount}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                          bet.result === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' 
                            : bet.result === 'win' 
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-400/30'
                        }`}>
                          {bet.result.charAt(0).toUpperCase() + bet.result.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Placed: {new Date(bet.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multiplier Info */}
        <div className="mt-6 sm:mt-8 bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-yellow-400">🎯 Multiplier System</h3>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2 sm:gap-4">
            {amounts.map(amount => (
              <div key={amount.value} className="text-center p-2 sm:p-3 bg-white/5 rounded-lg">
                <div className="font-bold text-sm sm:text-lg">₹{amount.value}</div>
                <div className="text-yellow-400 font-semibold text-xs sm:text-sm">{amount.multiplier}x</div>
                <div className="text-xs text-gray-400">Win: ₹{Math.floor(amount.value * amount.multiplier)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        onSuccess={handleAddMoneySuccess}
        currentBalance={balance}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentBalance={balance}
      />

      <WithdrawalRequests
        isOpen={showWithdrawalRequests}
        onClose={() => setShowWithdrawalRequests(false)}
        token={token}
      />
    </div>
  );
};

export default Betting; 