import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <button 
          className="btn-ghost"
          onClick={() => disconnect()}
          style={{ 
            fontSize: '12px', 
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🔗</span>
          <span>{formatAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button 
        className="btn"
        onClick={() => {
          // Try Farcaster MiniApp first, then injected wallet
          const farcasterConnector = connectors.find(c => c.name === 'Farcaster MiniApp');
          const injectedConnector = connectors.find(c => c.name === 'Injected');
          
          const connector = farcasterConnector || injectedConnector || connectors[0];
          if (connector) {
            connect({ connector });
          }
        }}
        style={{ 
          fontSize: '12px', 
          padding: '6px 12px' 
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
}
