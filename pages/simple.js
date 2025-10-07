export default function SimplePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '20px' }}>✅ Cast Flow is Working!</h1>
      <p style={{ marginBottom: '20px', textAlign: 'center' }}>
        This is a simple test page to verify the app is loading correctly.
      </p>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p>🎯 If you can see this, the deployment is successful!</p>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '10px' }}>
          Time: {new Date().toLocaleString()}
        </p>
      </div>
      <a 
        href="/"
        style={{
          marginTop: '20px',
          color: '#3b82f6',
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #3b82f6',
          borderRadius: '6px'
        }}
      >
        Go to Main App
      </a>
    </div>
  );
}
