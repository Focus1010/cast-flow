import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { supabase } from "../../../lib/supabase";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});
const neynar = new NeynarAPIClient(config);

export default async function handler(req, res) {
  // Verify this is a cron job request (add auth if needed)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Add cron secret verification
  const cronSecret = req.headers['authorization'];
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🕐 Processing scheduled posts...');
    
    // Get all posts that should be published now
    const now = new Date();
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .lte('datetime', now.toISOString())
      .eq('status', 'scheduled')
      .order('datetime', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled posts: ${fetchError.message}`);
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('📭 No posts to process');
      return res.status(200).json({ 
        message: 'No posts to process', 
        processed: 0 
      });
    }

    console.log(`📝 Found ${scheduledPosts.length} posts to process`);
    
    let processed = 0;
    let errors = [];

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        console.log(`🚀 Processing post ${post.id} for user ${post.user_id}`);
        
        // Get user data for signer_uuid
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('signer_uuid, username')
          .eq('fid', post.user_id)
          .single();

        if (userError || !user?.signer_uuid) {
          throw new Error(`User not found or missing signer: ${userError?.message}`);
        }

        // Prepare cast content
        let castContent = '';
        if (Array.isArray(post.posts)) {
          castContent = post.posts.join('\n\n---\n\n');
        } else {
          castContent = post.posts;
        }

        // Prepare cast data
        const castData = {
          signer_uuid: user.signer_uuid,
          text: castContent
        };

        // Add images if they exist
        if (post.images && post.images.length > 0) {
          castData.embeds = post.images.map(imageUrl => ({
            url: imageUrl
          }));
        }

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
          throw new Error(`Neynar API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ Successfully posted cast: ${result.cast.hash}`);

        // Update post status to 'posted'
        const { error: updateError } = await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'posted',
            posted_at: new Date().toISOString(),
            cast_hash: result.cast.hash
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Failed to update post status: ${updateError.message}`);
        }

        processed++;
        
      } catch (error) {
        console.error(`❌ Failed to process post ${post.id}:`, error.message);
        errors.push({
          postId: post.id,
          error: error.message
        });

        // Mark post as failed
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', post.id);
      }
    }

    console.log(`🎉 Processed ${processed} posts successfully`);
    
    return res.status(200).json({
      message: `Processed ${processed} scheduled posts`,
      processed,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('💥 Cron job error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
