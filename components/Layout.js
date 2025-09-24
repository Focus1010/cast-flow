import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';  // If needed for other Supabase calls; optional here
// Add SIWF logic if global

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
  // Fetch user from localStorage (stored after SIWF in index.js)
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);

  const toggleTheme = () => {
    const current = document.body.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <div className="app">
      <header className="header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 30 }}>Cast Flow</div>
          <nav className="desktop-nav nav">
            <Link href="/">Scheduler</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/tips">Micro-Tips</Link>
            <Link href="/packages">Buy Package</Link>
            <Link href="/profile">Profile</Link>
          </nav>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div className="mobile-nav">
            <button className="btn-ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
            {mobileMenuOpen && (
              <div className="dropdown">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>Scheduler</Link>
                <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
                <Link href="/tips" onClick={() => setMobileMenuOpen(false)}>Micro-Tips</Link>
                <Link href="/packages" onClick={() => setMobileMenuOpen(false)}>Buy Package</Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              </div>
            )}
          </div>
          {user ? (
            <button className="btn-ghost" onClick={() => { setUser(null); localStorage.removeItem('user'); }}>Disconnect</button>
          ) : (
            <button className="btn" onClick={() => { /* SIWF */ }}>Sign In</button>
          )}
        </div>
      </header>
      <button className="theme-toggle" onClick={toggleTheme}>🌓</button>
      <main>{children}</main>
    </div>
  );
}