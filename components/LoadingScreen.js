import React, { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
      color: 'white',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '20px',
        animation: 'pulse 2s infinite'
      }}>
        ⚡
      </div>
      
      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        margin: '0 0 8px 0',
        background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Cast Flow
      </h1>
      
      <p style={{
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.8)',
        margin: '0 0 20px 0'
      }}>
        Loading your Farcaster scheduler{dots}
      </p>
      
      <div style={{
        width: '200px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
          borderRadius: '2px',
          animation: 'loading 2s ease-in-out infinite'
        }} />
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
