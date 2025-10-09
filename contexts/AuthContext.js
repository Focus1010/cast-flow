import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { initializeFarcasterSDK, getFarcasterUser, getFarcasterContext } from '../lib/farcaster';

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
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Initialize Farcaster SDK first
        await initializeFarcasterSDK();
        
        // Try to get Farcaster user data
        const farcasterUser = getFarcasterUser();
        const farcasterContext = getFarcasterContext();
        
        console.log('Farcaster user:', farcasterUser);
        console.log('Farcaster context:', farcasterContext);
        
        if (farcasterUser && typeof farcasterUser === 'object' && farcasterUser.fid) {
          // User is in Farcaster environment - safely extract data
          const safeFid = typeof farcasterUser.fid === 'object' ? 
            (farcasterUser.fid.toString ? farcasterUser.fid.toString() : String(farcasterUser.fid)) : 
            farcasterUser.fid;
          
          const userData = {
            fid: safeFid,
            wallet: farcasterUser.custody_address || address,
            isConnected: true,
            username: farcasterUser.username || 'User',
            display_name: farcasterUser.display_name || 'Farcaster User',
            bio: farcasterUser.profile?.bio?.text || 'Farcaster user',
            pfp_url: farcasterUser.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${safeFid}`,
            follower_count: farcasterUser.follower_count || 0,
            following_count: farcasterUser.following_count || 0,
            custody_address: farcasterUser.custody_address || '',
          };
          
          setUser(userData);
          setAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          return;
        }
        
        if (isConnected && address) {
          // User has connected wallet - try to fetch Farcaster data
          setAuthenticated(true);
        
        try {
          // Try to get user data from Neynar using wallet address with timeout
          console.log('🔍 Fetching user data from Neynar for address:', address);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          
          const response = await fetch(`/api/get-user-by-address?address=${address}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }
          
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
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
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
          } else {
            console.warn('No wallet connectors available');
            // Set basic authenticated state even without wallet
            setAuthenticated(true);
            setUser({
              fid: 0,
              wallet: null,
              isConnected: false,
              username: 'Guest',
              display_name: 'Guest User',
              bio: 'Guest user',
              pfp_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=guest',
            });
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Don't let login failures crash the app
      setAuthenticated(true);
      setUser({
        fid: 0,
        wallet: null,
        isConnected: false,
        username: 'Guest',
        display_name: 'Guest User',
        bio: 'Connection failed',
        pfp_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=error',
      });
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
