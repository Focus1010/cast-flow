import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Farcaster Frame Meta Tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://cast-flow-app.vercel.app/frame-image.svg" />
        <meta property="fc:frame:button:1" content="Open Cast Flow" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://cast-flow-app.vercel.app" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cast Flow - Schedule Your Casts" />
        <meta property="og:description" content="Schedule your Farcaster posts and reward followers with token tips" />
        <meta property="og:image" content="https://cast-flow-app.vercel.app/frame-image.svg" />
        <meta property="og:url" content="https://cast-flow-app.vercel.app" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cast Flow - Schedule Your Casts" />
        <meta name="twitter:description" content="Schedule your Farcaster posts and reward followers with token tips" />
        <meta name="twitter:image" content="https://cast-flow-app.vercel.app/frame-image.svg" />
        
        {/* App Meta Tags */}
        <meta name="description" content="Schedule your Farcaster posts and reward followers with token tips" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
        
        {/* Mobile debugging script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Mobile debugging
            console.log('Cast Flow loading on:', navigator.userAgent);
            
            // Catch and log all errors
            window.addEventListener('error', function(e) {
              console.error('Global error:', e.error, e.filename, e.lineno);
            });
            
            window.addEventListener('unhandledrejection', function(e) {
              console.error('Unhandled promise rejection:', e.reason);
            });
            
            // Log when DOM is ready
            document.addEventListener('DOMContentLoaded', function() {
              console.log('DOM loaded successfully');
            });
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
