import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frame error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.error('ErrorBoundary caught error:', this.state.error);
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
          <h2>🔧 Cast Flow Loading...</h2>
          <p>Initializing your scheduling experience</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
            Error: {this.state.error?.message || 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
