import crypto from 'crypto';
import { supabase } from '../../lib/supabase'; // Adjust path

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;
    const signature = req.headers['x-neynar-signature'];

    // Verify signature (use your webhook secret from Neynar dashboard)
    const secret = process.env.NEYNAR_WEBHOOK_SECRET; // Add to .env.local
    const computedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    if (signature !== computedSig) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process the event (e.g., cast.created for tips)
    const event = body;
    console.log('Webhook received:', event);
    if (event.type === 'cast.created') {
      // Example: Save to Supabase if it's a tip (customize based on your logic)
      await supabase.from('tips').insert({
        post_id: event.data.hash,
        tipper_fid: event.data.author.fid,
        amount: 1, // Parse from text or logic
      });
    }

    // Acknowledge
    res.status(200).json({ message: 'Webhook processed' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: true, // Enable body parsing
  },
};