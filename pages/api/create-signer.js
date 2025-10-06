// API endpoint to create a Farcaster signer for posting
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});
const neynar = new NeynarAPIClient(config);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.body;

  if (!fid) {
    return res.status(400).json({ 
      error: 'FID is required' 
    });
  }

  if (!process.env.NEYNAR_API_KEY) {
    return res.status(500).json({ 
      error: 'Neynar API key not configured' 
    });
  }

  try {
    console.log('🔑 Creating signer for FID:', fid);

    // Create a signer for the user
    const signerResponse = await neynar.createSigner();
    
    console.log('✅ Signer created:', signerResponse);

    // Return the signer details and approval URL
    return res.status(200).json({
      success: true,
      signer_uuid: signerResponse.signer_uuid,
      public_key: signerResponse.public_key,
      status: signerResponse.status,
      approval_url: signerResponse.farcaster_developer_managed_signer?.approval_url,
      message: 'Signer created successfully. User needs to approve it via the approval URL.'
    });

  } catch (error) {
    console.error('❌ Error creating signer:', error);
    return res.status(500).json({
      error: 'Failed to create signer',
      message: error.message
    });
  }
}
