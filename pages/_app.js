import '../styles/mobile.css';
import '../styles/globals.css';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingScreen from '../components/LoadingScreen';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

// Create config with error handling
const createWagmiConfig = () => {
  try {
    return createConfig({
      chains: [base],
      transports: { [base.id]: http() },
      connectors: [
        farcasterMiniApp({
          relay: 'https://relay.farcaster.xyz',
          rpcUrl: 'https://mainnet.base.org',
          domain: 'cast-flow-app.vercel.app'
        })
      ]
    });
  } catch (error) {
    console.error('Error creating Wagmi config:', error);
    // Fallback config without Farcaster connector
    return createConfig({
      chains: [base],
      transports: { [base.id]: http() },
      connectors: []
    });
  }
};

const config = createWagmiConfig();

export default function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    
    // Prevent wallet conflicts
    if (typeof window !== 'undefined') {
      // Handle ethereum provider conflicts gracefully
      const handleError = (event) => {
        console.error('App error:', event.error);
        if (event.error?.message?.includes('ethereum') || 
            event.error?.message?.includes('Cannot redefine property')) {
          console.warn('Wallet provider conflict detected, continuing...');
          event.preventDefault();
          return false;
        }
      };
      
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled rejection:', event.reason);
        if (event.reason?.message?.includes('ethereum') ||
            event.reason?.message?.includes('Cannot redefine property')) {
          console.warn('Wallet provider promise rejection, continuing...');
          event.preventDefault();
          return false;
        }
      });
      
      // Add mobile-specific debugging
      if (isMobile) {
        console.log('Mobile device detected, initializing mobile optimizations...');
      }
      
      // Set loading to false after a short delay to ensure everything is loaded
      const timer = setTimeout(() => {
        console.log('App initialization complete');
        setIsLoading(false);
      }, isMobile ? 2000 : 1500); // Longer delay for mobile
      
      return () => {
        window.removeEventListener('error', handleError);
        clearTimeout(timer);
      };
    }
  }, [isMobile]);

  // Show loading screen on mobile or during initial load
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}