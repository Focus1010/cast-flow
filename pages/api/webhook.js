import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const signature = req.headers['x-neynar-signature'];
    const secret = process.env.NEYNAR_WEBHOOK_SECRET; // Add to env
    const computedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
    if (signature !== computedSig) return res.status(401).json({ error: 'Invalid signature' });

    const event = req.body;
    console.log('Webhook received:', event);
    // Process event (e.g., update Supabase for tips)
    if (event.type === 'cast.created') {
      await supabase.from('tips').insert({ post_id: event.data.hash, tipper_fid: event.data.author.fid, amount: 1 });
    }

    res.status(200).json({ message: 'Processed' });
  } else {
    res.status(405).end();
  }
}