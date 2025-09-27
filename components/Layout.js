import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Cast Flow</div>
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>
        <nav className="nav">
          <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <Link href="/" onClick={handleCloseMenu}>Scheduler</Link>
            <Link href="/leaderboard" onClick={handleCloseMenu}>Leaderboard</Link>
            <Link href="/tips" onClick={handleCloseMenu}>Tips Configuration</Link>
            <Link href="/packages" onClick={handleCloseMenu}>Buy Package</Link>
            <Link href="/profile" onClick={handleCloseMenu}>Profile</Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
