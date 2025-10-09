import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type = 'tippers' } = req.query;

  try {
    let data = [];
    
    if (type === 'tippers') {
      // Get top tippers based on total tips given
      const { data: tippersData, error: tippersError } = await supabase
        .from('tip_pools')
        .select(`
          creator_fid,
          total_amount,
          token,
          users!inner(fid, username, display_name, pfp_url, bio)
        `)
        .order('total_amount', { ascending: false })
        .limit(50);

      if (tippersError) {
        console.error('Error fetching tippers:', tippersError);
        return res.status(500).json({ error: 'Failed to fetch tippers data' });
      }

      // Aggregate tips by user
      const tipperMap = new Map();
      tippersData?.forEach(tip => {
        const fid = tip.creator_fid;
        if (!tipperMap.has(fid)) {
          tipperMap.set(fid, {
            fid,
            username: tip.users?.username || `user${fid}`,
            display_name: tip.users?.display_name || 'Unknown User',
            pfp_url: tip.users?.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`,
            bio: tip.users?.bio || 'Cast Flow user',
            totalTipped: 0,
            tipCount: 0
          });
        }
        
        const user = tipperMap.get(fid);
        user.totalTipped += parseFloat(tip.total_amount || 0);
        user.tipCount += 1;
      });

      data = Array.from(tipperMap.values())
        .sort((a, b) => b.totalTipped - a.totalTipped)
        .slice(0, 20);

    } else if (type === 'schedulers') {
      // Get top schedulers based on number of scheduled posts
      const { data: schedulersData, error: schedulersError } = await supabase
        .from('scheduled_posts')
        .select(`
          user_fid,
          users!inner(fid, username, display_name, pfp_url, bio)
        `)
        .order('created_at', { ascending: false });

      if (schedulersError) {
        console.error('Error fetching schedulers:', schedulersError);
        return res.status(500).json({ error: 'Failed to fetch schedulers data' });
      }

      // Aggregate posts by user
      const schedulerMap = new Map();
      schedulersData?.forEach(post => {
        const fid = post.user_fid;
        if (!schedulerMap.has(fid)) {
          schedulerMap.set(fid, {
            fid,
            username: post.users?.username || `user${fid}`,
            display_name: post.users?.display_name || 'Unknown User',
            pfp_url: post.users?.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`,
            bio: post.users?.bio || 'Cast Flow user',
            postsScheduled: 0
          });
        }
        
        const user = schedulerMap.get(fid);
        user.postsScheduled += 1;
      });

      data = Array.from(schedulerMap.values())
        .sort((a, b) => b.postsScheduled - a.postsScheduled)
        .slice(0, 20);
    }

    // If no real data, return empty array instead of mock data
    if (!data || data.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: 'No leaderboard data available yet'
      });
    }

    return res.status(200).json({ 
      success: true, 
      data,
      type 
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
