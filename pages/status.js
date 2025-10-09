import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [status, setStatus] = useState({
    userAgent: '',
    viewport: '',
    screen: '',
    connection: '',
    errors: []
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Collect system information
      const info = {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        screen: `${screen.width}x${screen.height}`,
        connection: navigator.connection ? 
          `${navigator.connection.effectiveType} (${navigator.connection.downlink}Mbps)` : 
          'Unknown',
        errors: []
      };

      // Test API health
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          console.log('API Health:', data);
        })
        .catch(err => {
          info.errors.push(`API Error: ${err.message}`);
        });

      setStatus(info);
    }
  }, []);

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
          📊 Cast Flow Status
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>System Information</h2>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>User Agent:</strong>
            <div style={{ fontSize: '12px', wordBreak: 'break-all', marginTop: '4px' }}>
              {status.userAgent}
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Viewport:</strong> {status.viewport}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Screen:</strong> {status.screen}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Connection:</strong> {status.connection}
          </div>
        </div>

        {status.errors.length > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#ef4444' }}>
              ⚠️ Errors Detected
            </h2>
            {status.errors.map((error, index) => (
              <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                {error}
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>
            ✅ App Status
          </h2>
          <p style={{ marginBottom: '12px' }}>
            React: {typeof React !== 'undefined' ? '✅ Loaded' : '❌ Not loaded'}
          </p>
          <p style={{ marginBottom: '12px' }}>
            Next.js: {typeof window !== 'undefined' && window.next ? '✅ Loaded' : '✅ SSR'}
          </p>
          <p style={{ marginBottom: '12px' }}>
            CSS: {typeof document !== 'undefined' && document.styleSheets.length > 0 ? '✅ Loaded' : '❌ Not loaded'}
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => window.location.href = '/scheduler'}
            style={{
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            Go to Scheduler
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
