// Enhanced Cast Flow Frame for Interaction Tracking and Tip Distribution
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { supabase } from "../../lib/supabase";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});
const neynar = new NeynarAPIClient(config);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return frame metadata (initial frame view)
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html>
        <head>
          <title>Cast Flow Frame</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://your-image-url.com/welcome.png" /> <!-- Add a welcome image -->
          <meta property="fc:frame:button:1" content="Start Scheduling" />
          <meta property="fc:frame:post_url" content="${process.env.VERCEL_URL || 'http://localhost:3000'}/api/frame" />
        </head>
        <body></body>
      </html>
    `);
  } else if (req.method === 'POST') {
    // Handle button click - get and verify FID
    const { trustedData, untrustedData } = req.body;
    try {
      // Verify the frame action with Neynar
      const response = await neynar.validateFrameAction(trustedData.messageBytes, {
        castReactionContext: false,
        followContext: false,
        signerContext: false,
      });
      if (!response.valid) {
        throw new Error('Invalid frame action');
      }
      const fid = response.action.interactor.fid; // Verified FID
      // Fetch or create user in Supabase
      const { data: u, error } = await supabase.from('users').select('*').eq('fid', fid).single();
      if (error || !u) {
        await supabase.from('users').insert({
          fid,
          wallet: response.action.interactor.verifiedAddresses[0] || '', // Optional wallet
          signer_uuid: response.action.signer.uuid, // If available
          monthly_used: 0,
          package_type: null,
          premium_expiry: 0,
          is_admin: fid === Number(process.env.ADMIN_FID),
        });
      }
      // Return updated frame metadata for authenticated view (e.g., scheduler interface)
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <html>
          <head>
            <title>Cast Flow - Authenticated</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://your-image-url.com/scheduler.png" />
            <meta property="fc:frame:button:1" content="Schedule Cast" />
            <meta property="fc:frame:post_url" content="${process.env.VERCEL_URL || 'http://localhost:3000'}/api/schedule" /> <!-- New endpoint for actions -->
            <meta property="fc:frame:input:text" content="Enter cast text" />
          </head>
          <body></body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Error authenticating');
    }
  }
}