import '../styles/globals.css';
import Layout from '../components/Layout';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected, walletConnect } from 'wagmi/connectors';
import { AuthProvider } from '../contexts/AuthContext';
const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [
    farcasterMiniApp(),
    injected({ shimDisconnect: true })
    // Temporarily disabled WalletConnect to avoid config errors
    // walletConnect({
    //   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    //   metadata: {
    //     name: 'Cast Flow',
    //     description: 'Farcaster Post Scheduler',
    //     url: 'https://cast-flow.vercel.app',
    //     icons: ['https://cast-flow.vercel.app/icon.png']
    //   }
    // })
  ]
});

export default function MyApp({ Component, pageProps }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        farcaster: {
          // Use push notifications instead of QR code for mobile
          loginMethod: 'redirect',
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}