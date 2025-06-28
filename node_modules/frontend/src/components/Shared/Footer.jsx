import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-t from-black via-gray-900 to-gray-800 text-white mt-auto overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-red-500/10 animate-pulse"></div>
      </div>
      
      {/* Top decorative border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-60"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {/* Casino Chip Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border-2 border-white/30">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30"></div>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent tracking-wide">
                  SattaWala
                </h3>
                <p className="text-xs text-gray-400 tracking-widest">PREMIUM GAMING EXPERIENCE</p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Experience the thrill of premium gaming with SattaWala. Your trusted platform for secure, fair, and exciting betting entertainment.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <SocialIcon icon="📘" label="Facebook" />
              <SocialIcon icon="🐦" label="Twitter" />
              <SocialIcon icon="📸" label="Instagram" />
              <SocialIcon icon="💬" label="Telegram" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">🔗</span>
              Quick Links
            </h4>
            <div className="space-y-2">
              <FooterLink href="/" icon="🏠">Home</FooterLink>
              <FooterLink href="/bet" icon="🎰">Live Betting</FooterLink>
              <FooterLink href="/results" icon="📊">Results</FooterLink>
              <FooterLink href="/games" icon="🎮">Games</FooterLink>
              <FooterLink href="/promotions" icon="🎁">Promotions</FooterLink>
            </div>
          </div>
          
          {/* Support & Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">📞</span>
              Support
            </h4>
            <div className="space-y-2">
              <FooterLink href="/help" icon="❓">Help Center</FooterLink>
              <FooterLink href="/contact" icon="📧">Contact Us</FooterLink>
              <FooterLink href="/terms" icon="📋">Terms of Service</FooterLink>
              <FooterLink href="/privacy" icon="🔒">Privacy Policy</FooterLink>
              <FooterLink href="/responsible" icon="🛡️">Responsible Gaming</FooterLink>
            </div>
          </div>
        </div>
        
        {/* Gaming Stats Section */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StatCard number="50K+" label="Active Players" icon="👥" />
            <StatCard number="₹10M+" label="Daily Payouts" icon="💰" />
            <StatCard number="99.9%" label="Uptime" icon="⚡" />
            <StatCard number="24/7" label="Support" icon="🕒" />
          </div>
        </div>
        
        {/* Gaming Badges */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <Badge text="🔒 SSL Secured" />
            <Badge text="✅ Fair Play Certified" />
            <Badge text="🏆 Licensed Gaming" />
            <Badge text="💳 Secure Payments" />
            <Badge text="📱 Mobile Optimized" />
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} SattaWala. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Licensed and regulated gaming platform • Play responsibly
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <span>🌍</span>
                <span>Global Platform</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🕒</span>
                <span>24/7 Gaming</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🎯</span>
                <span>Fair & Secure</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Age Restriction Notice */}
        <div className="mt-6 p-4 bg-gradient-to-r from-red-900/20 to-yellow-900/20 border border-yellow-400/30 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-yellow-400 text-sm">
            <span className="text-xl">🔞</span>
            <span className="font-semibold">18+ Only</span>
            <span>•</span>
            <span>Gamble Responsibly</span>
            <span>•</span>
            <span>Terms & Conditions Apply</span>
          </div>
        </div>
      </div>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-yellow-400/10 to-transparent blur-3xl"></div>
    </footer>
  );
};

// Social Media Icon Component
const SocialIcon = ({ icon, label }) => (
  <div className="group relative">
    <button className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-yellow-500 hover:to-yellow-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-yellow-500/25">
      <span className="text-lg group-hover:scale-110 transition-transform duration-200">{icon}</span>
    </button>
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
      {label}
    </div>
  </div>
);

// Footer Link Component
const FooterLink = ({ href, children, icon }) => (
  <a
    href={href}
    className="group flex items-center space-x-2 text-gray-400 hover:text-yellow-400 text-sm transition-all duration-200 hover:translate-x-1"
  >
    <span className="text-sm group-hover:scale-110 transition-transform duration-200">{icon}</span>
    <span className="relative">
      {children}
      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 group-hover:w-full transition-all duration-300"></span>
    </span>
  </a>
);

// Stats Card Component
const StatCard = ({ number, label, icon }) => (
  <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200">
      {number}
    </div>
    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
      {label}
    </div>
  </div>
);

// Badge Component
const Badge = ({ text }) => (
  <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-3 py-1 rounded-full text-xs font-medium text-gray-300 border border-gray-600 hover:border-yellow-400/50 transition-all duration-200 hover:text-yellow-400">
    {text}
  </div>
);

export default Footer;