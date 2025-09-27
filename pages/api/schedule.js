import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { supabase } from "../../lib/supabase"; // Adjust path if needed
import { ethers } from "ethers";
import contractABI from "../../utils/contractABI.json"; // Adjust path

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});
const neynar = new NeynarAPIClient(config);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { trustedData, untrustedData } = req.body;
    try {
      // Validate frame action
      const response = await neynar.validateFrameAction(trustedData.messageBytes, {
        castReactionContext: false,
        followContext: false,
        signerContext: false,
      });
      if (!response.valid) {
        throw new Error('Invalid frame action');
      }
      const fid = response.action.interactor.fid;
      const text = response.action.input?.text || ''; // From frame input:text
      // Assume datetime from untrustedData or default to now + 1 hour (customize)
      const datetime = untrustedData.input?.datetime || new Date(Date.now() + 3600000).toISOString(); // Example
      const timestamp = Math.floor(new Date(datetime).getTime() / 1000);

      // Fetch user from Supabase (with signer_uuid)
      const { data: user } = await supabase.from('users').select('*').eq('fid', fid).single();
      if (!user || !user.signer_uuid) {
        throw new Error('User not found or no signer');
      }

      // Publish scheduled cast (experimental)
      const castResponse = await fetch('https://api.neynar.com/v2/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.NEYNAR_API_KEY,
          'x-neynar-experimental': 'true',
        },
        body: JSON.stringify({
          signer_uuid: user.signer_uuid,
          text,
          scheduled_at: timestamp,
        }),
      });
      if (!castResponse.ok) {
        throw new Error(await castResponse.text());
      }
      const castData = await castResponse.json();
      const castId = castData.hash;

      // Insert to Supabase
      await supabase.from('scheduled_posts').insert({
        user_id: fid,
        posts: [text], // Assume single for simplicity
        datetime,
        cast_id: castId,
      });

      // Optional: Register in contract (use admin signer for server-side)
      const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
      const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
      const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);
      await contract.registerScheduledPost(castId, timestamp, user.wallet);

      // Return success frame metadata
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <html>
          <head>
            <title>Cast Flow - Success</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://your-image-url.com/success.png" /> <!-- Customize -->
            <meta property="fc:frame:button:1" content="View Scheduled" />
            <meta property="fc:frame:post_url" content="${process.env.VERCEL_URL || 'http://localhost:3000'}/api/view-scheduled" /> <!-- Optional next action -->
          </head>
          <body></body>
        </html>
      `);
    } catch (error) {
      console.error(error);
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <html>
          <head>
            <title>Cast Flow - Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://your-image-url.com/error.png" /> <!-- Customize -->
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="${process.env.VERCEL_URL || 'http://localhost:3000'}/api/frame" />
          </head>
          <body></body>
        </html>
      `);
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}