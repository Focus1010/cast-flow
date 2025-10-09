import React, { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { getUserInitials } from "../utils/helpers";

export default function SchedulerPage() {
  const { address } = useAccount();
  const { user, authenticated, login } = useAuth();
  
  // State for thread composer
  const [thread, setThread] = useState([
    { id: 1, content: "", placeholder: "What's happening on Farcaster?" },
    { id: 2, content: "", placeholder: "Continue your thought..." }
  ]);
  
  // State for scheduling
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("14:30");
  
  // State for package info
  const [packageInfo, setPackageInfo] = useState({
    plan: "Free Plan",
    used: 3,
    total: 10
  });
  
  // State for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle thread post content changes
  const handlePostChange = (id, content) => {
    setThread(prev => prev.map(post => 
      post.id === id ? { ...post, content } : post
    ));
  };

  // Add another post to thread
  const addAnotherPost = () => {
    const newPost = {
      id: Date.now(),
      content: "",
      placeholder: "Continue your thought..."
    };
    setThread(prev => [...prev, newPost]);
  };

  // Remove post from thread
  const removePost = (id) => {
    if (thread.length > 1) {
      setThread(prev => prev.filter(post => post.id !== id));
    }
  };

  // Handle scheduling
  const handleSchedule = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const validPosts = thread.filter(post => post.content.trim());
    if (validPosts.length === 0) {
      alert('Please write at least one post');
      return;
    }

    setIsLoading(true);
    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.fid,
          posts: validPosts.map(p => p.content),
          datetime: scheduledDateTime.toISOString(),
          status: 'scheduled'
        })
        .select();

      if (error) throw error;

      // Reset form
      setThread([
        { id: 1, content: "", placeholder: "What's happening on Farcaster?" },
        { id: 2, content: "", placeholder: "Continue your thought..." }
      ]);
      setSelectedDate("");
      setSelectedTime("14:30");
      
      // Update package usage
      setPackageInfo(prev => ({ ...prev, used: prev.used + 1 }));
      
      alert('Post scheduled successfully!');
      
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data and package info
  useEffect(() => {
    if (user) {
      // Load package info and usage
      // This would connect to your existing package system
    }
  }, [user]);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  }, []);

  if (!authenticated) {
    return (
      <div className="scheduler-page">
        <div className="page-header">
          <div>
            <Logo size={28} showText={true} />
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="notification-badge"></span>
            </button>
            <div className="user-avatar">JD</div>
          </div>
        </div>
        
        <div className="auth-prompt">
          <p>Please connect your wallet to start scheduling posts</p>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduler-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cast Flow</h1>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            🔔
            <span className="notification-badge"></span>
          </button>
          <div className="user-avatar">
{getUserInitials(user, 'JD')}
          </div>
        </div>
      </div>

      <div className="scheduler-content">
        {/* Package Status Banner */}
        <div className="package-banner">
          <div className="package-info">
            <div className="package-icon">📦</div>
            <div className="package-details">
              <div className="package-name">{packageInfo.plan}</div>
              <div className="package-usage">{packageInfo.used}/{packageInfo.total} posts used</div>
              <div className="usage-bar">
                <div 
                  className="usage-progress" 
                  style={{ width: `${(packageInfo.used / packageInfo.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <button className="upgrade-btn">Upgrade</button>
        </div>

        {/* Compose Thread Section */}
        <div className="compose-section">
          <div className="section-header">
            <h2>✏️ Compose Thread</h2>
          </div>
          
          <div className="thread-composer">
            {thread.map((post, index) => (
              <div key={post.id} className="post-composer">
                <div className="post-header">
                  <span className="post-label">Post {index + 1}</span>
                  {thread.length > 1 && (
                    <button 
                      className="remove-post-btn"
                      onClick={() => removePost(post.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <textarea
                  className="post-textarea"
                  placeholder={post.placeholder}
                  value={post.content}
                  onChange={(e) => handlePostChange(post.id, e.target.value)}
                  maxLength={280}
                />
                <div className="char-count">
                  {post.content.length}/280
                </div>
              </div>
            ))}
            
            <button className="add-post-btn" onClick={addAnotherPost}>
              ➕ Add Another Post
            </button>
          </div>
        </div>

        {/* Schedule Time Section */}
        <div className="schedule-section">
          <div className="section-header">
            <h2>📅 Schedule Time</h2>
          </div>
          
          <div className="datetime-inputs">
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              className="time-input"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>
          
          <div className="timezone-info">
            🌍 Pacific Standard Time (PST)
          </div>
        </div>

        {/* Schedule Button */}
        <button 
          className={`schedule-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleSchedule}
          disabled={isLoading}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Post'}
        </button>
      </div>
    </div>
  );
}
