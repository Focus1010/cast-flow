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

    // Try to get user by verified address using the bulk endpoint
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          'Accept': 'application/json',
          'api_key': neynarApiKey,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Neynar API error:', response.status, response.statusText);
      
      // If bulk-by-address fails, try the search endpoint as fallback
      try {
        const searchResponse = await fetch(
          `https://api.neynar.com/v2/farcaster/user/search?q=${address}&limit=10`,
          {
            headers: {
              'Accept': 'application/json',
              'api_key': neynarApiKey,
            },
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('🔍 Search API response:', searchData);
          
          if (searchData.result && searchData.result.users && searchData.result.users.length > 0) {
            // Check if any user has this address in their verified addresses
            const userWithAddress = searchData.result.users.find(user => {
              const ethAddresses = user.verified_addresses?.eth_addresses || [];
              const custodyAddress = user.custody_address?.toLowerCase();
              return ethAddresses.some(addr => 
                addr.toLowerCase() === address.toLowerCase()
              ) || custodyAddress === address.toLowerCase();
            });

            if (userWithAddress) {
              console.log('✅ Found Farcaster user via search for address:', address);
              return res.status(200).json({
                success: true,
                user: userWithAddress
              });
            }
          }
        }
      } catch (searchError) {
        console.error('❌ Search fallback also failed:', searchError);
      }
      
      return res.status(500).json({ 
        success: false, 
        error: `Neynar API error: ${response.status}` 
      });
    }

    const data = await response.json();
    console.log('📊 Bulk API response:', data);
    
    if (data && data[address] && data[address].length > 0) {
      const user = data[address][0];
      return res.status(200).json({ success: true, user });
    } else {
      return res.status(200).json({ 
        success: false, 
        error: 'User not found',
        fallback: true 
      });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(200).json({ 
      success: false, 
      error: 'Internal server error',
      fallback: true 
    });
  }
}
