import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { config } from '../lib/wagmi';
import { initializeFarcasterSDK } from '../lib/farcaster';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/globals.css';
import '../styles/mobile.css';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    let initTimeout;
    
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log('Mobile check:', mobile);
    };
    
    const debugEnvironment = () => {
      const info = {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        location: window.location.href,
        isIframe: window !== window.top,
        parentOrigin: window !== window.top ? document.referrer : 'Not in iframe',
        dimensions: `${window.innerWidth}x${window.innerHeight}`,
        isFarcaster: document.referrer.includes('farcaster') || window.location.href.includes('farcaster'),
        hasEthereum: !!window.ethereum,
        hasFarcaster: !!window.farcaster,
        hasWebkit: !!window.webkit
      };
      
      console.log('=== FARCASTER DEBUG INFO ===');
      Object.entries(info).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      
      setDebugInfo(JSON.stringify(info, null, 2));
      return info;
    };
    
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        checkMobile();
        const envInfo = debugEnvironment();
        
        // Set a timeout for initialization
        initTimeout = setTimeout(() => {
          console.warn('App initialization timeout, proceeding anyway...');
          setIsLoading(false);
        }, 8000); // Longer timeout for Farcaster
        
        // Handle errors gracefully
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
        
        // Initialize Farcaster SDK with retries
        let sdkInitialized = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Farcaster SDK initialization attempt ${attempt}...`);
            await initializeFarcasterSDK();
            console.log('Farcaster SDK initialized successfully');
            sdkInitialized = true;
            break;
          } catch (error) {
            console.warn(`SDK init attempt ${attempt} failed:`, error);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
        
        if (!sdkInitialized) {
          console.warn('Farcaster SDK failed to initialize after 3 attempts, continuing without it');
        }
        
        // Wait a bit more for Farcaster environment to stabilize
        await new Promise(resolve => setTimeout(resolve, envInfo.isFarcaster ? 3000 : 1000));
        
        clearTimeout(initTimeout);
        console.log('App initialization complete');
        setIsLoading(false);
        
      } catch (error) {
        console.error('App initialization error:', error);
        clearTimeout(initTimeout);
        setIsLoading(false);
      }
    };
    
    initializeApp();
    
    return () => {
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, []);

  // Show loading screen on mobile or during initial load
  if (isLoading) {
    return <LoadingScreen debugInfo={debugInfo} />;
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