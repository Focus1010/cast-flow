import '../styles/globals.css';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [
    farcasterMiniApp(),
    coinbaseWallet({
      appName: 'Cast Flow',
      appLogoUrl: 'https://cast-flow-app.vercel.app/icon.png',
    }),
    injected({ shimDisconnect: true })
  ]
});

export default function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted immediately to prevent loading screen hang
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    // Handle mini-app specific initialization
    if (typeof window !== 'undefined') {
      // Prevent zoom on mobile
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Handle frame errors gracefully
      window.addEventListener('error', (event) => {
        console.warn('Frame error caught:', event.error);
        // Don't let frame errors crash the app
        event.preventDefault();
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.warn('Unhandled promise rejection:', event.reason);
        // Don't let promise rejections crash the app
        event.preventDefault();
      });
    }

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div>Loading Cast Flow...</div>
      </div>
    );
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