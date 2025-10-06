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
        // User has connected wallet - try to fetch Farcaster data
        setAuthenticated(true);
        
        try {
          // Try to get user data from Neynar using wallet address
          console.log('🔍 Fetching user data from Neynar for address:', address);
          const response = await fetch(`/api/get-user-by-address?address=${address}`);
          const userData = await response.json();
          
          console.log('📊 Neynar API response:', userData);
          
          if (userData.success && userData.user) {
            // Found Farcaster user data
            const farcasterUser = {
              fid: userData.user.fid,
              wallet: address,
              isConnected: isConnected,
              username: userData.user.username || 'User',
              display_name: userData.user.display_name || 'Connected User',
              bio: userData.user.profile?.bio?.text || 'Farcaster user',
              pfp_url: userData.user.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
              follower_count: userData.user.follower_count || 0,
              following_count: userData.user.following_count || 0,
              custody_address: userData.user.custody_address || '',
            };
            
            console.log('✅ Farcaster user data found:', farcasterUser);
            setUser(farcasterUser);
            localStorage.setItem('user', JSON.stringify(farcasterUser));
          } else {
            // No Farcaster data found, create basic user
            const basicUser = {
              fid: 0, // No FID found
              wallet: address,
              isConnected: isConnected,
              username: 'User',
              display_name: 'Connected User',
              bio: 'Wallet connected user',
              pfp_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
            };
            
            console.log('⚠️ No Farcaster data found, using basic user:', basicUser);
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user
          const basicUser = {
            fid: 0,
            wallet: address,
            isConnected: isConnected,
            username: 'User',
            display_name: 'Connected User',
            bio: 'Wallet connected user',
            pfp_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
          };
          
          setUser(basicUser);
          localStorage.setItem('user', JSON.stringify(basicUser));
        }
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
