// Simple test page to verify mobile functionality
export default function TestPage() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Cast Flow Mobile Test</h1>
      <p style={{ fontSize: '16px', marginBottom: '20px' }}>
        If you can see this page, the app is loading correctly on mobile!
      </p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '14px' }}>
          User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}
        </p>
      </div>
      <button 
        onClick={() => window.location.href = '/scheduler'}
        style={{
          background: '#7c3aed',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Go to Scheduler
      </button>
    </div>
  );
}
