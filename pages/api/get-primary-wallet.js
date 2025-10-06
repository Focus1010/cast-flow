// API endpoint to get user's primary wallet from Farcaster context
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.body;

  if (!fid) {
    return res.status(400).json({ error: 'FID is required' });
  }

  try {
    // First get user data from Neynar
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      method: 'GET',
      headers: {
        'api_key': process.env.NEYNAR_API_KEY,
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    const user = userData.users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Strategy to find primary wallet:
    // 1. Look for verified addresses that are NOT custody
    // 2. Prioritize addresses that appear in recent transactions
    // 3. Use the most recently verified address

    let primaryWallet = '';
    const ethAddresses = user.verified_addresses?.eth_addresses || [];
    const custodyAddress = user.custody_address?.toLowerCase();

    console.log('🔍 Analyzing addresses for FID', fid, ':', {
      custody: user.custody_address,
      verified: ethAddresses,
      total_verified: ethAddresses.length
    });

    if (ethAddresses.length > 0) {
      // Filter out custody address to find the primary connected wallet
      const nonCustodyAddresses = ethAddresses.filter(addr => 
        addr.toLowerCase() !== custodyAddress
      );

      if (nonCustodyAddresses.length > 0) {
        // Use the first non-custody address (this is typically the primary)
        primaryWallet = nonCustodyAddresses[0];
        console.log('✅ Found primary wallet (non-custody):', primaryWallet);
      } else {
        // All verified addresses are custody, use the first one
        primaryWallet = ethAddresses[0];
        console.log('⚠️ Only custody addresses found, using first:', primaryWallet);
      }
    } else {
      // No verified addresses, use custody as fallback
      primaryWallet = user.custody_address || '';
      console.log('⚠️ No verified addresses, using custody:', primaryWallet);
    }

    return res.status(200).json({
      success: true,
      primaryWallet,
      custodyAddress: user.custody_address,
      allVerifiedAddresses: ethAddresses,
      strategy: nonCustodyAddresses?.length > 0 ? 'non-custody-verified' : 
                ethAddresses.length > 0 ? 'first-verified' : 'custody-fallback'
    });

  } catch (error) {
    console.error('Error getting primary wallet:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}
