import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAccount } from 'wagmi';
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const { user, authenticated, login } = useAuth();
  const { address } = useAccount();
  
  // Check if user is admin
  const isAdmin = user?.fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID);
  
  // State for add new token form
  const [newToken, setNewToken] = useState({
    contractAddress: '',
    ticker: '',
    name: '',
    network: ''
  });
  
  // State for active tokens
  const [activeTokens, setActiveTokens] = useState([
    {
      id: 1,
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'ETH • Native Token',
      address: '0x0000...0000',
      activeConfigs: 23,
      totalTipped: 12400,
      users: 156,
      enabled: true
    },
    {
      id: 2,
      symbol: 'USDC',
      name: 'USD Coin',
      type: 'USDC • Stablecoin',
      address: '0x833...2913',
      activeConfigs: 45,
      totalTipped: 8900,
      users: 203,
      enabled: true
    }
  ]);
  
  // State for loading
  const [loading, setLoading] = useState(false);

  const handleAddToken = async () => {
    if (!newToken.contractAddress || !newToken.ticker || !newToken.name || !newToken.network) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // In production, this would add to your smart contract and database
      const tokenToAdd = {
        id: Date.now(),
        symbol: newToken.ticker,
        name: newToken.name,
        type: `${newToken.ticker} • ${newToken.network}`,
        address: `${newToken.contractAddress.substring(0, 6)}...${newToken.contractAddress.substring(newToken.contractAddress.length - 4)}`,
        activeConfigs: 0,
        totalTipped: 0,
        users: 0,
        enabled: true
      };

      setActiveTokens(prev => [...prev, tokenToAdd]);
      
      // Reset form
      setNewToken({
        contractAddress: '',
        ticker: '',
        name: '',
        network: ''
      });

      alert('Token added successfully!');
      
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleToken = async (tokenId) => {
    setActiveTokens(prev => 
      prev.map(token => 
        token.id === tokenId 
          ? { ...token, enabled: !token.enabled }
          : token
      )
    );
  };

  const handleDisableToken = async (tokenId) => {
    if (!confirm('Are you sure you want to disable this token?')) return;
    
    setActiveTokens(prev => 
      prev.map(token => 
        token.id === tokenId 
          ? { ...token, enabled: false }
          : token
      )
    );
  };

  const handleExportData = () => {
    const data = {
      activeTokens,
      exportDate: new Date().toISOString(),
      totalTokens: activeTokens.length,
      enabledTokens: activeTokens.filter(t => t.enabled).length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cast-flow-tokens-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">⚡ Admin Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="user-avatar">AD</div>
          </div>
        </div>
        
        <div className="auth-prompt">
          <p>Please connect your wallet to access admin dashboard</p>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">⚡ Admin Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="user-avatar">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'JD'}
            </div>
          </div>
        </div>
        
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ Admin Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="notification-btn">🔔</button>
          <div className="user-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Add New Token Section */}
        <div className="admin-section">
          <div className="section-header">
            <h2>💰 Add New Token</h2>
            <button className="expand-btn">▼</button>
          </div>
          
          <div className="add-token-form">
            <div className="form-row">
              <div className="form-group">
                <label>Contract Address *</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newToken.contractAddress}
                  onChange={(e) => setNewToken({...newToken, contractAddress: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Token Ticker *</label>
                <input
                  type="text"
                  placeholder="USDC"
                  value={newToken.ticker}
                  onChange={(e) => setNewToken({...newToken, ticker: e.target.value.toUpperCase()})}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Token Name *</label>
                <input
                  type="text"
                  placeholder="USD Coin"
                  value={newToken.name}
                  onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Blockchain Network *</label>
                <select
                  value={newToken.network}
                  onChange={(e) => setNewToken({...newToken, network: e.target.value})}
                  className="form-select"
                >
                  <option value="">Select Network</option>
                  <option value="Base">Base</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Arbitrum">Arbitrum</option>
                </select>
              </div>
            </div>
            
            <button 
              className={`add-token-btn ${loading ? 'loading' : ''}`}
              onClick={handleAddToken}
              disabled={loading}
            >
              {loading ? 'Adding...' : '➕ Add Token'}
            </button>
          </div>
        </div>

        {/* Active Tokens Section */}
        <div className="admin-section">
          <div className="section-header">
            <h2>💎 Active Tokens ({activeTokens.length})</h2>
            <button className="export-btn" onClick={handleExportData}>
              📥 Export
            </button>
          </div>
          
          <div className="tokens-list">
            {activeTokens.map((token) => (
              <div key={token.id} className="token-card">
                <div className="token-header">
                  <div className="token-info">
                    <div className="token-symbol">{token.symbol}</div>
                    <div className="token-name">{token.name}</div>
                    <div className="token-type">{token.type}</div>
                  </div>
                  
                  <div className="token-toggle">
                    <div 
                      className={`toggle-switch ${token.enabled ? 'active' : ''}`}
                      onClick={() => handleToggleToken(token.id)}
                    >
                      <div className="toggle-slider"></div>
                    </div>
                  </div>
                </div>
                
                <div className="token-address">
                  {token.address}
                  <button className="copy-btn">📋</button>
                </div>
                
                <div className="token-stats">
                  <div className="stat-item">
                    <span className="stat-number">{token.activeConfigs}</span>
                    <span className="stat-label">Active Configs</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">${token.totalTipped.toLocaleString()}</span>
                    <span className="stat-label">Total Tipped</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{token.users}</span>
                    <span className="stat-label">Users</span>
                  </div>
                </div>
                
                <div className="token-actions">
                  <button className="action-btn view-btn">👁 View</button>
                  <button 
                    className="action-btn disable-btn"
                    onClick={() => handleDisableToken(token.id)}
                  >
                    ⚠️ Disable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
