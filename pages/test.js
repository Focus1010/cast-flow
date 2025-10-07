export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>🚀 Cast Flow Test Page</h1>
      <p>If you can see this, the app is working!</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
          Go to Main App
        </a>
      </div>
    </div>
  );
}
