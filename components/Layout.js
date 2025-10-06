import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from 'wagmi';
import { isAdmin } from '../utils/tokenGating';

export default function Layout({ children }) {
  const { login, logout, authenticated, user } = useAuth();
  const { address } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if current user is admin
  const userIsAdmin = authenticated && isAdmin(address, user?.fid);

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
            {userIsAdmin && (
              <Link href="/admin" onClick={handleNavClick} style={{ color: '#dc2626', fontWeight: 'bold' }}>
                👑 Admin
              </Link>
            )}
            {!authenticated ? (
              <button className="btn" onClick={login}>Connect Wallet</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {user?.display_name || user?.username || 'Connected'}
                </span>
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
            {userIsAdmin && (
              <Link href="/admin" onClick={handleNavClick} style={{ color: '#dc2626', fontWeight: 'bold' }}>
                👑 Admin Panel
              </Link>
            )}
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