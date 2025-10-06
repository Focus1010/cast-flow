// Debug endpoint to test Neynar API key
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key exists
    const apiKey = process.env.NEYNAR_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'NEYNAR_API_KEY not found in environment variables',
        hasKey: false
      });
    }

    // Check API key format (Neynar uses UUID format, not NEYNAR_API_ prefix)
    if (apiKey.length < 30) {
      return res.status(400).json({ 
        error: 'API key seems too short',
        hasKey: true,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10) + '...'
      });
    }

    // Test API key with a simple request
    const response = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=1', {
      method: 'GET',
      headers: {
        'api_key': apiKey,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(400).json({ 
        error: 'API key test failed',
        status: response.status,
        message: errorText,
        hasKey: true,
        keyPrefix: apiKey.substring(0, 15) + '...'
      });
    }

    const result = await response.json();
    
    return res.status(200).json({ 
      success: true,
      message: 'API key is working correctly!',
      hasKey: true,
      keyPrefix: apiKey.substring(0, 15) + '...',
      testResult: 'API call successful'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Debug test failed',
      message: error.message 
    });
  }
}
