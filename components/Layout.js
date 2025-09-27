import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa';

const Layout = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
            <Link href="/">Scheduler</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/tips">Tips Configuration</Link>
            <Link href="/packages">Buy Package</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;