import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAccount } from 'wagmi';
import { supabase } from "../lib/supabase";
import { isAdmin } from "../utils/tokenGating";

export default function AdminPage() {
  const { user, authenticated, login } = useAuth();
  const { address } = useAccount();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState({});
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenAmount, setNewTokenAmount] = useState('');
  const [newAdminAddress, setNewAdminAddress] = useState('');

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      
      if (!user || !address) {
        setIsAdminUser(false);
        setLoading(false);
        return;
      }

      const adminStatus = isAdmin(address, user.fid);
      setIsAdminUser(adminStatus);
      
      if (adminStatus) {
        await loadConfigs();
      }
      
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, address]);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('*');
      
      if (error) throw error;
      
      const configObj = {};
      data.forEach(config => {
        configObj[config.config_key] = config.config_value;
      });
      
      setConfigs(configObj);
    } catch (error) {
      console.error('Error loading configs:', error);
      alert('Failed to load admin configurations');
    }
  };

  const updateConfig = async (key, value) => {
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert({
          config_key: key,
          config_value: value,
          updated_by: address,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setConfigs(prev => ({ ...prev, [key]: value }));
      alert('Configuration updated successfully!');
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration: ' + error.message);
    }
  };

  const addToken = async () => {
    if (!newTokenAddress || !newTokenSymbol || !newTokenAmount) {
      alert('Please fill all token fields');
      return;
    }

    const currentTokens = configs.unlimited_access_tokens || {};
    const updatedTokens = {
      ...currentTokens,
      [newTokenSymbol]: {
        address: newTokenAddress,
        min_amount: newTokenAmount,
        decimals: 18 // Default, can be made configurable
      }
    };

    await updateConfig('unlimited_access_tokens', updatedTokens);
    setNewTokenAddress('');
    setNewTokenSymbol('');
    setNewTokenAmount('');
  };

  const removeToken = async (symbol) => {
    if (!confirm(`Remove ${symbol} from unlimited access tokens?`)) return;
    
    const currentTokens = configs.unlimited_access_tokens || {};
    const { [symbol]: removed, ...updatedTokens } = currentTokens;
    
    await updateConfig('unlimited_access_tokens', updatedTokens);
  };

  const addAdminAddress = async () => {
    if (!newAdminAddress) {
      alert('Please enter an admin address');
      return;
    }

    const currentAddresses = configs.admin_addresses || [];
    if (currentAddresses.includes(newAdminAddress.toLowerCase())) {
      alert('Address is already an admin');
      return;
    }

    const updatedAddresses = [...currentAddresses, newAdminAddress.toLowerCase()];
    await updateConfig('admin_addresses', updatedAddresses);
    setNewAdminAddress('');
  };

  const removeAdminAddress = async (addressToRemove) => {
    if (!confirm(`Remove ${addressToRemove} from admin addresses?`)) return;
    
    const currentAddresses = configs.admin_addresses || [];
    const updatedAddresses = currentAddresses.filter(addr => addr !== addressToRemove);
    
    await updateConfig('admin_addresses', updatedAddresses);
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="mb-3">Admin Panel</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="card">
        <h2 className="mb-3">Admin Panel</h2>
        <p className="small mb-3">Please connect your wallet to access admin panel.</p>
        <button className="btn" onClick={login}>Connect Wallet</button>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="card">
        <h2 className="mb-3">Admin Panel</h2>
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#fef2f2", 
          borderRadius: "8px",
          border: "1px solid #fecaca"
        }}>
          <p style={{ margin: 0, color: "#dc2626" }}>
            ❌ Access Denied: You don't have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="mb-3">🛠️ Admin Panel</h2>
      
      <div style={{ 
        marginBottom: "24px", 
        padding: "12px", 
        backgroundColor: "#dcfce7", 
        borderRadius: "6px",
        border: "1px solid #16a34a"
      }}>
        <p style={{ margin: 0, color: "#15803d", fontSize: "14px" }}>
          ✅ Admin Access Granted - Welcome {user?.display_name || user?.username || 'Admin'}!
        </p>
      </div>

      {/* Token Management Section */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>💰 Unlimited Access Tokens</h3>
        
        {/* Current Tokens */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Current Tokens:</h4>
          {Object.entries(configs.unlimited_access_tokens || {}).map(([symbol, config]) => (
            <div key={symbol} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "8px 12px", 
              backgroundColor: "#f9fafb", 
              borderRadius: "4px",
              marginBottom: "8px"
            }}>
              <div>
                <strong>{symbol}</strong> - {config.min_amount} tokens required
                <br />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  Address: {config.address}
                </span>
              </div>
              <button 
                onClick={() => removeToken(symbol)}
                style={{ 
                  padding: "4px 8px", 
                  backgroundColor: "#dc2626", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add New Token */}
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#f9fafb", 
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <h4 style={{ fontSize: "14px", marginBottom: "12px" }}>Add New Token:</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "8px", alignItems: "end" }}>
            <div>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Symbol</label>
              <input
                type="text"
                placeholder="e.g. MYTOKEN"
                value={newTokenSymbol}
                onChange={(e) => setNewTokenSymbol(e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "6px", fontSize: "12px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Contract Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={newTokenAddress}
                onChange={(e) => setNewTokenAddress(e.target.value)}
                style={{ width: "100%", padding: "6px", fontSize: "12px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Min Amount</label>
              <input
                type="number"
                placeholder="1000"
                value={newTokenAmount}
                onChange={(e) => setNewTokenAmount(e.target.value)}
                style={{ width: "100%", padding: "6px", fontSize: "12px" }}
              />
            </div>
            <button
              onClick={addToken}
              style={{ 
                padding: "6px 12px", 
                backgroundColor: "#16a34a", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Add Token
            </button>
          </div>
        </div>
      </div>

      {/* Admin Address Management */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>👑 Admin Addresses</h3>
        
        {/* Current Admins */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Current Admins:</h4>
          {(configs.admin_addresses || []).map((addr, index) => (
            <div key={index} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "8px 12px", 
              backgroundColor: "#f9fafb", 
              borderRadius: "4px",
              marginBottom: "8px"
            }}>
              <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{addr}</span>
              <button 
                onClick={() => removeAdminAddress(addr)}
                style={{ 
                  padding: "4px 8px", 
                  backgroundColor: "#dc2626", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add New Admin */}
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#f9fafb", 
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <h4 style={{ fontSize: "14px", marginBottom: "12px" }}>Add New Admin:</h4>
          <div style={{ display: "flex", gap: "8px", alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                style={{ width: "100%", padding: "6px", fontSize: "12px" }}
              />
            </div>
            <button
              onClick={addAdminAddress}
              style={{ 
                padding: "6px 12px", 
                backgroundColor: "#16a34a", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Add Admin
            </button>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div>
        <h3 style={{ marginBottom: "16px" }}>📊 System Statistics</h3>
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#f9fafb", 
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
            🔧 Admin panel is ready for Cast Flow management
          </p>
          <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
            Use this panel to manage unlimited access tokens and admin privileges
          </p>
        </div>
      </div>
    </div>
  );
}
