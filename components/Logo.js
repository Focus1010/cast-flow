import React from 'react';

export default function Logo({ size = 32, className = '', showText = true }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Logo Icon - Replace with your actual logo */}
      <div 
        className="logo-icon"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: `${size * 0.5}px`
        }}
      >
        ⚡
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span 
          className="logo-text"
          style={{
            fontSize: `${size * 0.6}px`,
            fontWeight: '700',
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Cast Flow
        </span>
      )}
    </div>
  );
}

// Alternative version with image (uncomment when you have your logo file)
/*
export default function Logo({ size = 32, className = '', showText = true }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src="/logo.png" // Replace with your logo file
        alt="Cast Flow Logo"
        width={size}
        height={size}
        style={{ borderRadius: '4px' }}
      />
      
      {showText && (
        <span 
          className="logo-text"
          style={{
            fontSize: `${size * 0.6}px`,
            fontWeight: '700',
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Cast Flow
        </span>
      )}
    </div>
  );
}
*/
