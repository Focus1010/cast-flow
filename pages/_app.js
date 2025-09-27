import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { MiniAppProvider } from '@neynar/react';

function MyApp({ Component, pageProps }) {
  return (
    <MiniAppProvider analyticsEnabled={true}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MiniAppProvider>
  );
}

export default MyApp;