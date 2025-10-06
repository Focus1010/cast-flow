import '../styles/globals.css';
import Layout from '../components/Layout';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { AuthProvider } from '../contexts/AuthContext';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [
    farcasterMiniApp(),
    coinbaseWallet({
      appName: 'Cast Flow',
      appLogoUrl: 'https://cast-flow.vercel.app/icon.png',
    }),
    injected({ shimDisconnect: true })
  ]
});

export default function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}