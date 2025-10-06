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
        // For Farcaster mini app, fetch user data from Neynar API
        try {
          const fid = privyUser.farcaster?.fid;
          if (fid) {
            console.log('🔍 Fetching user data from Neynar for FID:', fid);
            
            // Fetch user data from Neynar
            const response = await fetch(`/api/get-user-data?fid=${fid}`);
            const userData = await response.json();
            
            if (userData.success) {
              // Get the primary connected wallet (not custody address)
              let primaryWallet = '';
              console.log('🔍 Available addresses:', {
                custody: userData.user.custody_address,
                verified_eth: userData.user.verified_addresses?.eth_addresses,
                all_verified: userData.user.verified_addresses
              });
              
              if (userData.user.verified_addresses?.eth_addresses?.length > 0) {
                // Use the first verified Ethereum address as primary
                primaryWallet = userData.user.verified_addresses.eth_addresses[0];
                console.log('✅ Using verified ETH address as primary:', primaryWallet);
              } else if (userData.user.custody_address) {
                // Fallback to custody address if no verified addresses
                primaryWallet = userData.user.custody_address;
                console.log('⚠️ No verified addresses, using custody address:', primaryWallet);
              }
              
              const newUser = {
                fid: fid,
                wallet: primaryWallet,
                custody_address: userData.user.custody_address || '',
                signer_uuid: privyUser.farcaster?.signerUuid || '',
                is_admin: fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID),
                username: userData.user.username || '',
                bio: userData.user.profile?.bio?.text || '',
                display_name: userData.user.display_name || '',
                pfp_url: userData.user.pfp_url || '',
                follower_count: userData.user.follower_count || 0,
                following_count: userData.user.following_count || 0,
              };
              
              console.log('✅ User data fetched:', newUser);
              setUser(newUser);
              localStorage.setItem('user', JSON.stringify(newUser));
            } else {
              // Fallback to Privy data if Neynar fails
              console.log('⚠️ Neynar fetch failed, using Privy data');
              const newUser = {
                fid: fid,
                wallet: privyUser.wallet?.address || '',
                signer_uuid: privyUser.farcaster?.signerUuid || '',
                is_admin: fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID),
                username: privyUser.farcaster?.username || '',
                bio: privyUser.farcaster?.bio || '',
              };
              setUser(newUser);
              localStorage.setItem('user', JSON.stringify(newUser));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to Privy data
          const newUser = {
            fid: privyUser.farcaster?.fid || 0,
            wallet: privyUser.wallet?.address || '',
            signer_uuid: privyUser.farcaster?.signerUuid || '',
            is_admin: privyUser.farcaster?.fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID),
            username: privyUser.farcaster?.username || '',
            bio: privyUser.farcaster?.bio || '',
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
        }
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
