import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { supabase } from "../lib/supabase";

export default function CastFlowMiniApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [datetime, setDatetime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);

  useEffect(() => {
    setMounted(true);
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    if (!isConnected || !address) return;
    
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', address)
        .order('datetime', { ascending: true });
      
      if (!error && data) {
        setScheduledPosts(data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
      if (farcasterConnector) {
        await connect({ connector: farcasterConnector });
      } else {
        // Fallback to first available connector
        const availableConnector = connectors[0];
        if (availableConnector) {
          await connect({ connector: availableConnector });
        }
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleSchedule = async () => {
    if (!content.trim() || !datetime || !isConnected) return;
    
    setIsScheduling(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: address,
          posts: [content],
          datetime: new Date(datetime).toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();
      
      if (!error) {
        setContent('');
        setDatetime('');
        loadScheduledPosts();
        alert('✅ Cast scheduled successfully!');
      } else {
        alert('❌ Failed to schedule cast');
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      alert('❌ Failed to schedule cast');
    } finally {
      setIsScheduling(false);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
            🔄 Cast Flow
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            Schedule your Farcaster posts
          </p>
        </div>
        
        {!isConnected ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '30px 20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔗</div>
              <p style={{ marginBottom: '20px', color: '#94a3b8' }}>
                Connect your wallet to start scheduling casts
              </p>
              <button
                onClick={handleConnect}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Connected Status */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Wallet Connected</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>

            {/* Schedule Form */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📝 Schedule a Cast</h3>
              
              <textarea
                placeholder="What do you want to cast?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical',
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
                maxLength={320}
              />
              
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>
                {content.length}/320 characters
              </div>
              
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: 'white',
                  marginBottom: '15px',
                  boxSizing: 'border-box'
                }}
              />
              
              <button
                onClick={handleSchedule}
                disabled={!content.trim() || !datetime || isScheduling}
                style={{
                  width: '100%',
                  backgroundColor: content.trim() && datetime ? '#10b981' : '#374151',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: content.trim() && datetime ? 'pointer' : 'not-allowed',
                  opacity: isScheduling ? 0.7 : 1
                }}
              >
                {isScheduling ? '⏳ Scheduling...' : '🚀 Schedule Cast'}
              </button>
            </div>

            {/* Scheduled Posts */}
            {scheduledPosts.length > 0 && (
              <div style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📅 Scheduled Casts</h3>
                {scheduledPosts.slice(0, 3).map((post, idx) => (
                  <div key={post.id} style={{
                    backgroundColor: '#111827',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #374151'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                      {post.posts[0]?.slice(0, 50)}...
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      📅 {new Date(post.datetime).toLocaleDateString()} at {new Date(post.datetime).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '12px', color: post.status === 'posted' ? '#10b981' : '#f59e0b', marginTop: '5px' }}>
                      {post.status === 'posted' ? '✅ Posted' : '⏳ Scheduled'}
                    </div>
                  </div>
                ))}
                {scheduledPosts.length > 3 && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                    +{scheduledPosts.length - 3} more scheduled
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
