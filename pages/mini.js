import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';

export default function MiniApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
      if (farcasterConnector) {
        await connect({ connector: farcasterConnector });
      }
    } catch (error) {
      console.error('Connection failed:', error);
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
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🔄 Cast Flow
        </h1>
        
        {!isConnected ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '20px', color: '#94a3b8' }}>
              Connect your wallet to schedule casts
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
                cursor: 'pointer'
              }}
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>✅ Wallet Connected</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0' }}>📝 Quick Schedule</h3>
              <textarea
                placeholder="What do you want to cast?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              <input
                type="datetime-local"
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: 'white'
                }}
              />
              <button
                style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '15px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Schedule Cast
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a 
                href="/"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                Go to Full App →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
