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
    farcasterMiniApp({
      relay: 'https://relay.farcaster.xyz',
      rpcUrl: 'https://mainnet.base.org',
      domain: 'cast-flow-app.vercel.app'
    })
  ]
});

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Prevent wallet conflicts
    if (typeof window !== 'undefined') {
      // Handle ethereum provider conflicts gracefully
      const handleError = (event) => {
        if (event.error?.message?.includes('ethereum') || 
            event.error?.message?.includes('Cannot redefine property')) {
          console.warn('Wallet provider conflict detected, continuing...');
          event.preventDefault();
          return false;
        }
      };
      
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('ethereum') ||
            event.reason?.message?.includes('Cannot redefine property')) {
          console.warn('Wallet provider promise rejection, continuing...');
          event.preventDefault();
          return false;
        }
      });
      
      return () => {
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

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