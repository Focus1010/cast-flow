export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    
    if (!neynarApiKey) {
      console.error('❌ NEYNAR_API_KEY not found in environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Neynar API key not configured' 
      });
    }

    // Search for user by verified address
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/search?q=${address}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'api_key': neynarApiKey,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Neynar API error:', response.status, response.statusText);
      return res.status(500).json({ 
        success: false, 
        error: `Neynar API error: ${response.status}` 
      });
    }

    const data = await response.json();
    
    if (data.result && data.result.users && data.result.users.length > 0) {
      // Check if any user has this address in their verified addresses
      const userWithAddress = data.result.users.find(user => {
        const ethAddresses = user.verified_addresses?.eth_addresses || [];
        return ethAddresses.some(addr => 
          addr.toLowerCase() === address.toLowerCase()
        );
      });

      if (userWithAddress) {
        console.log('✅ Found Farcaster user for address:', address);
        return res.status(200).json({
          success: true,
          user: userWithAddress
        });
      }
    }

    // No user found with this address
    console.log('⚠️ No Farcaster user found for address:', address);
    return res.status(200).json({
      success: false,
      message: 'No Farcaster user found for this address'
    });

  } catch (error) {
    console.error('❌ Error fetching user by address:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
