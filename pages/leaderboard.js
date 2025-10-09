import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tippers");
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data matching your design
  const mockLeaderboard = [
    {
      rank: 1,
      username: "vitalik.eth",
      fid: 5650,
      avatar: "VB",
      amount: 2450,
      count: 45,
      percentage: 98
    },
    {
      rank: 2,
      username: "dwr.eth",
      fid: 3,
      avatar: "DC",
      amount: 1850,
      count: 38,
      percentage: 95
    },
    {
      rank: 3,
      username: "jessepollak",
      fid: 2,
      avatar: "JM",
      amount: 1320,
      count: 32,
      percentage: 92
    },
    {
      rank: 4,
      username: "abishek",
      fid: 13,
      avatar: "AB",
      amount: 980,
      count: 28,
      percentage: 88
    },
    {
      rank: 5,
      username: "cdixon.eth",
      fid: 156,
      avatar: "CF",
      amount: 750,
      count: 24,
      percentage: 85
    },
    {
      rank: 6,
      username: "neynar",
      fid: 89,
      avatar: "NJ",
      amount: 650,
      count: 22,
      percentage: 82
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLeaderboard(mockLeaderboard);
      setUserRank(47); // Mock user rank
      setLoading(false);
    }, 1000);
  }, [activeTab]);

  const handleImproveRanking = () => {
    // Navigate to tips configuration or packages
    alert("Improve your ranking by tipping more users or scheduling more posts!");
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">🏆 Leaderboard</h1>
            <p className="page-subtitle">Top Farcaster Creators</p>
          </div>
          <div className="header-actions">
            <div className="user-avatar">JD</div>
            <button className="notification-btn">
              🔔
              <span className="notification-badge"></span>
            </button>
          </div>
        </div>
        <div className="loading-state">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Leaderboard</h1>
          <p className="page-subtitle">Top Farcaster Creators</p>
        </div>
        <div className="header-actions">
          <div className="user-avatar">JD</div>
          <button className="notification-btn">
            🔔
            <span className="notification-badge"></span>
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'tippers' ? 'active' : ''}`}
            onClick={() => setActiveTab('tippers')}
          >
            Top Tippers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedulers' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedulers')}
          >
            Top Schedulers
          </button>
        </div>

        {/* User Rank Card */}
        <div className="user-rank-card">
          <div className="rank-info">
            <span className="rank-badge">You're ranked #{userRank}</span>
          </div>
          <button className="improve-btn" onClick={handleImproveRanking}>
            Improve Ranking
          </button>
        </div>

        {/* Section Title */}
        <h2 className="section-title">
          {activeTab === 'tippers' ? 'Top Tippers' : 'Top Schedulers'}
        </h2>

        {/* Leaderboard List */}
        <div className="leaderboard-list">
          {leaderboard.map((item) => (
            <div key={item.fid} className="leaderboard-item">
              <div className="rank-circle">
                {item.rank}
              </div>
              
              <div className="user-avatar-large">
                {item.avatar}
              </div>
              
              <div className="user-details">
                <div className="user-header">
                  <span className="username">{item.username}</span>
                  <span className="verified-badge">✓</span>
                </div>
                <div className="user-fid">FID: {item.fid}</div>
                
                <div className="user-stats">
                  <span className="stat-amount">${item.amount.toLocaleString()}</span>
                  <span className="stat-count">📝 {item.count}</span>
                  <span className="stat-percentage">💖 {item.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
