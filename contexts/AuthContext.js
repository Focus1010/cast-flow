import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { login, logout, authenticated, user: privyUser } = usePrivy();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      if (authenticated && privyUser) {
        // Get the actual connected wallet address (not embedded wallet)
        let actualWallet = '';
        try {
          if (window.ethereum) {
            const provider = new (await import('ethers')).BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            actualWallet = await signer.getAddress();
          }
        } catch (error) {
          console.log('No external wallet connected, using Privy wallet');
          actualWallet = privyUser.wallet?.address || '';
        }

        // User is authenticated with Privy
        const newUser = {
          fid: privyUser.farcaster?.fid || 0,
          wallet: actualWallet,
          signer_uuid: privyUser.farcaster?.signerUuid || '',
          is_admin: privyUser.farcaster?.fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID),
          username: privyUser.farcaster?.username || '',
          bio: privyUser.farcaster?.bio || '',
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        // Check localStorage for existing user data
        const storedUser = localStorage.getItem('user');
        if (storedUser && !authenticated) {
          // Clear stale data if not authenticated
          localStorage.removeItem('user');
          setUser(null);
        } else if (storedUser && authenticated) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [authenticated, privyUser]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
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
    privyUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
