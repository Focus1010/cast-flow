import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WalletConnect from './WalletConnect';

export default function Layout({ children }) {
  const { login, logout, authenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleNavClick = () => {
    closeMenu(); // Close mobile menu when navigating
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Cast Flow</h1>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="desktop-nav">
            <Link href="/" onClick={handleNavClick}>Scheduler</Link>
            <Link href="/leaderboard" onClick={handleNavClick}>Leaderboard</Link>
            <Link href="/tips" onClick={handleNavClick}>Micro-Tips</Link>
            <Link href="/packages" onClick={handleNavClick}>Buy Package</Link>
            <Link href="/profile" onClick={handleNavClick}>Profile</Link>
            {!authenticated ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn" onClick={login}>Farcaster Login</button>
                <WalletConnect />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <WalletConnect />
                <button className="btn-ghost" onClick={logout}>Disconnect</button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button Container */}
          <div className="header-actions">
            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown">
            <Link href="/" onClick={handleNavClick}>Scheduler</Link>
            <Link href="/leaderboard" onClick={handleNavClick}>Leaderboard</Link>
            <Link href="/tips" onClick={handleNavClick}>Micro-Tips</Link>
            <Link href="/packages" onClick={handleNavClick}>Buy Package</Link>
            <Link href="/profile" onClick={handleNavClick}>Profile</Link>
            <div className="mobile-auth-section">
              {!authenticated ? (
                <button className="btn mobile-auth-btn" onClick={() => { login(); handleNavClick(); }}>Connect Wallet</button>
              ) : (
                <button className="btn-ghost mobile-auth-btn" onClick={() => { logout(); handleNavClick(); }}>Disconnect</button>
              )}
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}