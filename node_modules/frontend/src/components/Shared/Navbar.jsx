import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentHistory from './PaymentHistory';

const Navbar = ({ user, onLogout, onLogin, token }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Get display name for user
  const getDisplayName = (user) => {
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    if (user.mobile) return user.mobile;
    return 'Player';
  };

  // Get avatar initial
  const getAvatarInitial = (user) => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    if (user.mobile) return user.mobile.charAt(0);
    return 'U';
  };

  return (
    <>
      <nav className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-2xl border-b border-yellow-400/30">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-red-500/10 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group">
              {/* Casino Chip Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 border-2 border-yellow-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border-2 border-white/30">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              
              {/* Brand Name */}
              <Link to="/" className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent tracking-wide">
                  SattaWala
                </h1>
                <p className="text-xs text-gray-400 tracking-widest">PREMIUM GAMING</p>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="/" icon="🏠">Home</NavLink>
              {user && <NavLink href="/bet" icon="🎰">Betting</NavLink>}
              {user && <NavLink href="/results" icon="📊">Results</NavLink>}
              {user?.isAdmin && <NavLink href="/admin" icon="⚙️">Admin</NavLink>}
            </div>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Payment History Button */}
                  <button
                    onClick={() => setShowPaymentHistory(true)}
                    className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>💳</span>
                      <span>History</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </button>

                  {/* User Avatar */}
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-700 px-3 py-2 rounded-full border border-yellow-400/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {getAvatarInitial(user)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getDisplayName(user)}</span>
                      {user.mobile && (
                        <span className="text-xs text-gray-400">{user.mobile}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>Logout</span>
                      <span className="text-lg">🚪</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-2 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Login
                  </Link>
                  <Link to="/register" className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-2 rounded-full font-semibold transition-all duration-300">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-yellow-400 focus:outline-none focus:text-yellow-400 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg mt-2 border border-yellow-400/20">
                <MobileNavLink href="/" icon="🏠">Home</MobileNavLink>
                {user && <MobileNavLink href="/bet" icon="🎰">Betting</MobileNavLink>}
                {user && <MobileNavLink href="/results" icon="📊">Results</MobileNavLink>}
                {user?.isAdmin && <MobileNavLink href="/admin" icon="⚙️">Admin</MobileNavLink>}
                
                {user ? (
                  <div className="pt-3 border-t border-gray-700">
                    {/* Payment History Button (Mobile) */}
                    <button
                      onClick={() => setShowPaymentHistory(true)}
                      className="w-full text-left px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors duration-200"
                    >
                      💳 Payment History
                    </button>
                    
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">
                        {getAvatarInitial(user)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{getDisplayName(user)}</span>
                        {user.mobile && (
                          <span className="text-xs text-gray-400">{user.mobile}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                    >
                      🚪 Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-700 space-y-2">
                    <Link to="/login" className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded font-bold text-center">
                      Login
                    </Link>
                    <Link to="/register" className="block w-full border border-yellow-400 text-yellow-400 px-4 py-2 rounded font-semibold text-center">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-60"></div>
      </nav>

      {/* Payment History Modal */}
      <PaymentHistory
        isOpen={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        token={token}
      />
    </>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ href, children, icon }) => (
  <a
    href={href}
    className="group relative flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white font-medium transition-all duration-300 rounded-lg hover:bg-white/5"
  >
    <span className="text-lg group-hover:scale-110 transition-transform duration-300">{icon}</span>
    <span className="relative">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 group-hover:w-full transition-all duration-300"></span>
    </span>
  </a>
);

// Mobile Navigation Link Component
const MobileNavLink = ({ href, children, icon }) => (
  <a
    href={href}
    className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
  >
    <span className="text-lg">{icon}</span>
    <span>{children}</span>
  </a>
);

export default Navbar;