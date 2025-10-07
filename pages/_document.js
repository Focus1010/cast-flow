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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0f172a" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
