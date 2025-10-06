export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId, signerUuid, text, images } = req.body;

  if (!postId || !signerUuid || !text) {
    return res.status(400).json({ 
      error: 'Missing required fields: postId, signerUuid, text' 
    });
  }

  // Check if NEYNAR_API_KEY exists
  if (!process.env.NEYNAR_API_KEY) {
    console.error('❌ NEYNAR_API_KEY not found in environment variables');
    return res.status(500).json({ 
      error: 'Neynar API key not configured',
      message: 'NEYNAR_API_KEY environment variable is missing'
    });
  }

  try {
    console.log('🚀 Posting cast immediately for post ID:', postId);
    console.log('🔑 NEYNAR_API_KEY status:', process.env.NEYNAR_API_KEY ? 'Present' : 'Missing');

    // Prepare cast data
    const castData = {
      signer_uuid: signerUuid,
      text: text
    };

    // Add images if they exist
    if (images && images.length > 0) {
      castData.embeds = images.map(imageUrl => ({
        url: imageUrl
      }));
    }

    console.log('📝 Cast data:', JSON.stringify(castData, null, 2));

    // Post the cast via Neynar
    const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY,
      },
      body: JSON.stringify(castData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Neynar API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to post cast',
        message: `Neynar API error: ${response.status} - ${errorText}`
      });
    }

    const result = await response.json();
    console.log('✅ Cast posted successfully:', result.cast.hash);

    return res.status(200).json({
      success: true,
      cast: result.cast,
      message: 'Cast posted successfully'
    });

  } catch (error) {
    console.error('💥 Post now error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
