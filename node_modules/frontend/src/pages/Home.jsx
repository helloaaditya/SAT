import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero-bg.jpg';
import coin from '../assets/coin.png';
import secure from '../assets/secure.png';
import instant from '../assets/instant.png';
import fair from '../assets/fair.png';
import logo from '../assets/logo.png';
import WinnersChatBubbles from '../components/Shared/WinnersChatBubbles';
import { apiCall } from '../utils/api';

// Random names for winners
const randomNames = [
  'Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Sara', 'Rohit', 'Anjali',
  'Raj', 'Meera', 'Arjun', 'Kavya', 'Dev', 'Zara', 'Karan', 'Ishita',
  'Vivek', 'Riya', 'Aditya', 'Pooja', 'Siddharth', 'Tanvi', 'Aryan', 'Neha',
  'Krishna', 'Ananya', 'Shivam', 'Diya', 'Rishabh', 'Mira', 'Dhruv', 'Aisha',
  'Kabir', 'Sana', 'Vedant', 'Kiara', 'Shaurya', 'Aria', 'Advait', 'Myra',
  'Ishaan', 'Zoya', 'Arnav', 'Avni', 'Reyansh', 'Kyra', 'Vihaan', 'Aaradhya'
];

// Generate random winners for marquee
const generateMarqueeWinners = () => {
  return Array.from({ length: 8 }, () => {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomAmount = Math.floor(Math.random() * (4000 - 400 + 1)) + 400;
    return { name: randomName, amount: randomAmount };
  });
};

const Marquee = () => {
  const [winners] = React.useState(generateMarqueeWinners());

  return (
    <div className="w-full bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 py-2 overflow-hidden relative">
      <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-yellow-400/30 via-transparent to-red-400/30 pointer-events-none"></div>
      <div className="whitespace-nowrap animate-marquee text-black font-semibold text-sm sm:text-base flex items-center gap-8 sm:gap-12">
        {winners.map((w, i) => (
          <span key={i} className="flex items-center gap-1 sm:gap-2">
            🏆 <span className="font-bold">{w.name}</span> won <span className="text-green-700 font-bold">₹{w.amount}</span> <span className="bg-yellow-300 text-yellow-900 px-1 sm:px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">10x Money!</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 100%;
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
};

const FloatingCoins = () => (
  <>
    {/* Floating coins using real coin images */}
    <img src={coin} alt="coin" className="absolute left-4 sm:left-10 top-6 sm:top-10 w-8 h-8 sm:w-12 sm:h-12 opacity-60 animate-float1 pointer-events-none select-none rounded-full" />
    <img src={coin} alt="coin" className="absolute right-8 sm:right-16 top-16 sm:top-24 w-12 h-12 sm:w-16 sm:h-16 opacity-40 animate-float2 pointer-events-none select-none rounded-full" />
    <img src={coin} alt="coin" className="absolute left-1/2 bottom-6 sm:bottom-10 w-8 h-8 sm:w-10 sm:h-10 opacity-50 animate-float3 pointer-events-none select-none rounded-full" />
    <style>{`
      @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
      @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-50px)} }
      @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
      .animate-float1 { animation: float1 6s ease-in-out infinite; }
      .animate-float2 { animation: float2 8s ease-in-out infinite; }
      .animate-float3 { animation: float3 7s ease-in-out infinite; }
    `}</style>
  </>
);

const Home = ({ user }) => {
  const [nextResultTime, setNextResultTime] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    let timer;
    const fetchNextResultTime = async () => {
      try {
        const data = await apiCall('/api/bet/next-result-time');
        if (data.nextResultTime) {
          setNextResultTime(new Date(data.nextResultTime));
          
          // Calculate time offset between client and server
          if (data.serverTime) {
            const serverTime = new Date(data.serverTime);
            const clientTime = new Date();
            const offset = serverTime.getTime() - clientTime.getTime();
            setServerTimeOffset(offset);
          }
        }
      } catch {}
    };
    fetchNextResultTime();
    timer = setInterval(() => {
      setNextResultTime(prev => prev ? new Date(prev) : null); // force rerender
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nextResultTime) return;
    const updateCountdown = () => {
      // Use server-synchronized time
      const now = new Date(Date.now() + serverTimeOffset);
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
  }, [nextResultTime, serverTimeOffset]);

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
    <div className="min-h-screen">
      {/* Floating chat-style winners bubbles */}
      <WinnersChatBubbles />

      {/* Hero Section with animation and 10x banner */}
      <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12 sm:py-16 lg:py-32 overflow-hidden">
        {/* Floating coins/chips animation */}
        <FloatingCoins />
        {/* Hero background image */}
        <img src={heroBg} alt="hero-bg" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            {/* Next Result Time */}
            {nextResultTime && (
              <div className="mb-4 flex flex-col items-center justify-center">
                <span className="inline-block bg-yellow-200 text-yellow-900 font-bold px-3 sm:px-4 py-1 rounded-full text-sm sm:text-base shadow animate-pulse">
                  Next Result: {formatTime(nextResultTime)}
                  {countdown && (
                    <span className="ml-2 text-gray-700 font-semibold text-xs sm:text-sm">(in {countdown})</span>
                  )}
                </span>
              </div>
            )}
            {/* Logo */}
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-2xl border-4 border-yellow-200 animate-pulse-slow overflow-hidden">
              <img src={logo} alt="SattaWala Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full object-cover" />
            </div>
            {/* Animated 10x Money Banner */}
            <div className="flex justify-center mb-4">
              <span className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-yellow-900 font-extrabold px-4 sm:px-6 py-2 rounded-full text-base sm:text-lg shadow-lg animate-bounce-slow border-2 border-yellow-300">
                🚀 Win <span className="text-xl sm:text-2xl font-black">10x</span> Your Money Instantly!
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              SattaWala
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-gray-200 leading-relaxed px-4">
              The most trusted and transparent satta platform. Predict the number, win 10x your money! 
              Join thousands of players who trust SattaWala for fair and secure betting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {user ? (
                <>
                  <Link
                    to="/bet"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-base sm:text-lg w-full sm:w-auto"
                  >
                    🎰 Go to Betting
                  </Link>
                  <Link
                    to="/results"
                    className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 text-base sm:text-lg w-full sm:w-auto"
                  >
                    📊 Results
                  </Link>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 text-base sm:text-lg w-full sm:w-auto"
                >
                  🔐 Sign In
                </Link>
              )}
            </div>
            {user?.referralCode && (
              <div className="mt-6 flex flex-col items-center px-4">
                <div className="bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-2 rounded-full flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-sm sm:text-base">
                  <span className="font-bold">Refer & Earn:</span>
                  <span className="text-xs sm:text-sm break-all">{window.location.origin}/register?ref={user.referralCode}</span>
                  <button
                    className="text-blue-600 underline text-xs ml-0 sm:ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode}`);
                      alert('Referral link copied!');
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-200 mt-2 text-center max-w-xs px-4">
                  Share your referral link! If a new user signs up with your link, <b>both of you</b> get <span className="text-green-400 font-bold">₹50</span> in your wallet instantly.
                </div>
              </div>
            )}
          </div>
        </div>
        <style>{`
          .animate-pulse-slow { animation: pulse 2.5s cubic-bezier(.4,0,.6,1) infinite; }
          .animate-bounce-slow { animation: bounce 2.2s infinite; }
        `}</style>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose SattaWala?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Experience the best satta platform with unmatched features and security
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-all duration-300">
              <img src={secure} alt="Secure & Safe" className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 rounded-full shadow-lg object-cover" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Secure & Safe</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Your data and transactions are protected with bank-level security. 
                We use advanced encryption to keep your information safe.
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-all duration-300">
              <img src={instant} alt="Instant Results" className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 rounded-full shadow-lg object-cover" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Instant Results</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get real-time results and instant payouts. No waiting, no delays. 
                Your winnings are credited immediately.
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-all duration-300">
              <img src={fair} alt="Fair & Transparent" className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 rounded-full shadow-lg object-cover" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Fair & Transparent</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Completely transparent system with fair odds. 
                Every bet is tracked and verified for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Simple steps to start your betting journey
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold text-black">
                1
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">Create Account</h3>
              <p className="text-xs sm:text-sm text-gray-600">Sign up with your email and get started in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold text-black">
                2
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">Add Balance</h3>
              <p className="text-xs sm:text-sm text-gray-600">Deposit funds to your account securely</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold text-black">
                3
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">Place Bets</h3>
              <p className="text-xs sm:text-sm text-gray-600">Choose your number and place your bet</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold text-black">
                4
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">Win Big</h3>
              <p className="text-xs sm:text-sm text-gray-600">Get instant payouts when you win</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Ready to Start Winning?</h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
            Join thousands of players who are already winning big on SattaWala
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-base sm:text-lg w-full sm:w-auto"
            >
              🎰 Start Betting Now
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 text-base sm:text-lg w-full sm:w-auto"
            >
              📞 Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 