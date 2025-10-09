import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { getUserInitials } from "../utils/helpers";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tippers");
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real leaderboard data
  const fetchLeaderboard = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/leaderboard?type=${type}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
      
      if (data.success) {
        // Add rank to each user
        const rankedData = data.data.map((user, index) => ({
          ...user,
          rank: index + 1,
          avatar: user.display_name ? user.display_name.substring(0, 2).toUpperCase() : 'U',
          amount: type === 'tippers' ? user.totalTipped : user.postsScheduled,
          count: type === 'tippers' ? user.tipCount : user.postsScheduled,
          percentage: Math.max(50, 100 - (index * 2)) // Simple percentage calculation
        }));
        
        setLeaderboard(rankedData);
        
        // Find current user's rank
        if (user?.fid) {
          const currentUserRank = rankedData.find(u => u.fid === user.fid);
          setUserRank(currentUserRank ? currentUserRank.rank : null);
        }
      } else {
        setLeaderboard([]);
        setUserRank(null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleImproveRanking = () => {
    // Navigate to tips configuration or packages
    alert("Improve your ranking by tipping more users or scheduling more posts!");
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="page-header">
          <div>
            <Logo size={28} showText={true} />
            <p className="page-subtitle">🏆 Top Farcaster Creators</p>
          </div>
          <div className="header-actions">
            <div className="user-avatar">
              {getUserInitials(user, 'U')}
            </div>
            <button className="notification-btn">🔔</button>
          </div>
        </div>

        <div className="leaderboard-content">
          <div className="loading-message">
            <p>Loading leaderboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <div>
          <Logo size={28} showText={true} />
          <p className="page-subtitle">🏆 Top Farcaster Creators</p>
        </div>
        <div className="header-actions">
          <div className="user-avatar">
            {getUserInitials(user, 'U')}
          </div>
          <button className="notification-btn">🔔</button>
        </div>
      </div>

      <div className="leaderboard-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'tippers' ? 'active' : ''}`}
            onClick={() => handleTabChange('tippers')}
          >
            💰 Top Tippers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedulers' ? 'active' : ''}`}
            onClick={() => handleTabChange('schedulers')}
          >
            📅 Top Schedulers
          </button>
        </div>

        {/* Current User Rank */}
        {userRank && (
          <div className="current-rank">
            <div className="rank-info">
              <span className="rank-number">#{userRank}</span>
              <span className="rank-text">Your current rank</span>
            </div>
            <button className="improve-btn" onClick={handleImproveRanking}>
              📈 Improve Ranking
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Leaderboard List */}
        {leaderboard.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h3>No Data Yet</h3>
            <p>Be the first to {activeTab === 'tippers' ? 'create tip pools' : 'schedule posts'} and claim the top spot!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((item) => (
              <div key={item.fid} className="leaderboard-item">
                <div className="rank-circle">
                  {item.rank}
                </div>
                
                <div className="user-avatar-large">
                  {item.pfp_url ? (
                    <img src={item.pfp_url} alt={item.username} />
                  ) : (
                    item.avatar
                  )}
                </div>
                
                <div className="user-details">
                  <div className="user-header">
                    <span className="username">@{item.username}</span>
                    <span className="user-fid">#{item.fid}</span>
                  </div>
                  <div className="user-stats">
                    <span className="amount">
                      {activeTab === 'tippers' ? `$${item.amount.toFixed(2)}` : `${item.amount} posts`}
                    </span>
                    <span className="count">
                      {activeTab === 'tippers' ? `${item.count} tips` : `${item.count} scheduled`}
                    </span>
                  </div>
                </div>
                
                <div className="percentage">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
