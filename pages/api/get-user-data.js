// API endpoint to fetch user data from Neynar for Farcaster mini app
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.query;

  if (!fid) {
    return res.status(400).json({ error: 'FID is required' });
  }

  try {
    // Fetch user data from Neynar
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      method: 'GET',
      headers: {
        'api_key': process.env.NEYNAR_API_KEY,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neynar API error:', response.status, errorText);
      return res.status(response.status).json({ 
        success: false,
        error: 'Failed to fetch user data from Neynar',
        details: errorText
      });
    }

    const data = await response.json();
    
    if (!data.users || data.users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const user = data.users[0];
    
    return res.status(200).json({
      success: true,
      user: {
        fid: user.fid,
        username: user.username,
        display_name: user.display_name,
        pfp_url: user.pfp_url,
        profile: user.profile,
        follower_count: user.follower_count,
        following_count: user.following_count,
        custody_address: user.custody_address,
        verified_addresses: user.verified_addresses,
        active_status: user.active_status
      }
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}
