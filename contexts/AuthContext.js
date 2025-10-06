import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      if (isConnected && address) {
        // User has connected wallet - simulate authentication
        setAuthenticated(true);
        
        // For now, create a basic user object
        // In a real Farcaster mini app, this data would come from the Farcaster frame context
        const basicUser = {
          fid: 0, // Will be populated when we get Farcaster context
          wallet: address,
          isConnected: isConnected,
          username: 'User',
          display_name: 'Connected User',
          bio: 'Wallet connected user',
          pfp_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        };
        
        console.log('✅ Wallet connected, basic user created:', basicUser);
        setUser(basicUser);
        localStorage.setItem('user', JSON.stringify(basicUser));
      } else {
        // No wallet connected
        setAuthenticated(false);
        const storedUser = localStorage.getItem('user');
        if (storedUser && !isConnected) {
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [isConnected, address]);

  const handleLogin = async () => {
    try {
      // Connect wallet - this will trigger authentication
      if (!isConnected) {
        const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
        if (farcasterConnector) {
          await connect({ connector: farcasterConnector });
        } else {
          // Fallback to any available connector
          const availableConnector = connectors[0];
          if (availableConnector) {
            await connect({ connector: availableConnector });
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (isConnected) {
        await disconnect();
      }
      setAuthenticated(false);
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    authenticated,
    login: handleLogin,
    logout: handleLogout,
    loading,
    isConnected,
    address,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
