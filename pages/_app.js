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
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { initializeFarcasterSDK } from '../lib/farcaster';

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
    
    // Initialize Farcaster SDK early
    initializeFarcasterSDK().then(() => {
      console.log('Farcaster SDK initialized in _app.js');
    }).catch(error => {
      console.warn('Farcaster SDK initialization failed:', error);
    });
    
    // Handle wallet provider conflicts gracefully without overriding Object.defineProperty
    if (typeof window !== 'undefined') {
      // Handle ethereum provider conflicts gracefully
      const handleError = (event) => {
        const errorMsg = event.error?.message || '';
        if (errorMsg.includes('ethereum') || 
            errorMsg.includes('Cannot redefine property') ||
            errorMsg.includes('Cannot set property ethereum') ||
            errorMsg.includes('Cannot convert object to primitive value')) {
          console.warn('Provider/conversion error detected, continuing...', errorMsg);
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      };
      
      window.addEventListener('error', handleError, true);
      window.addEventListener('unhandledrejection', (event) => {
        const errorMsg = event.reason?.message || '';
        if (errorMsg.includes('ethereum') ||
            errorMsg.includes('Cannot redefine property') ||
            errorMsg.includes('Cannot set property ethereum') ||
            errorMsg.includes('Cannot convert object to primitive value')) {
          console.warn('Provider/conversion promise rejection, continuing...', errorMsg);
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