import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.query;

  if (!fid) {
    return res.status(400).json({ error: 'FID parameter is required' });
  }

  try {
    // Get user's scheduled posts
    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select(`
        id,
        content,
        scheduled_time,
        status,
        created_at,
        posted_at,
        cast_hash,
        error_message,
        thread_posts
      `)
      .eq('user_fid', fid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    // Process the posts to add additional info
    const processedPosts = posts?.map(post => ({
      ...post,
      thread_count: post.thread_posts ? post.thread_posts.length : 1,
      is_scheduled: post.status === 'scheduled',
      is_posted: post.status === 'posted',
      is_failed: post.status === 'failed',
      time_until_post: post.status === 'scheduled' ? 
        Math.max(0, new Date(post.scheduled_time).getTime() - Date.now()) : 0
    })) || [];

    return res.status(200).json({ 
      success: true, 
      posts: processedPosts,
      total: processedPosts.length,
      scheduled: processedPosts.filter(p => p.is_scheduled).length,
      posted: processedPosts.filter(p => p.is_posted).length,
      failed: processedPosts.filter(p => p.is_failed).length
    });

  } catch (error) {
    console.error('User posts API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
