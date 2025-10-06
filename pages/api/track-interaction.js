// API endpoint for tracking Farcaster interactions and distributing tips
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { supabase } from "../../lib/supabase";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});
const neynar = new NeynarAPIClient(config);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cast_hash, interaction_type, user_fid } = req.body;

  if (!cast_hash || !interaction_type || !user_fid) {
    return res.status(400).json({ 
      error: 'Missing required fields: cast_hash, interaction_type, user_fid' 
    });
  }

  try {
    console.log('🎯 Tracking interaction:', { cast_hash, interaction_type, user_fid });

    // Step 1: Find the scheduled post that matches this cast
    const { data: scheduledPost, error: postError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('cast_hash', cast_hash)
      .eq('status', 'posted')
      .single();

    if (postError || !scheduledPost) {
      console.log('⚠️ No matching scheduled post found for cast:', cast_hash);
      return res.status(404).json({ error: 'Cast not found in scheduled posts' });
    }

    console.log('✅ Found matching post:', scheduledPost.id);

    // Step 2: Check if there are active tip pools for this post
    const { data: tipPools, error: poolError } = await supabase
      .from('tip_pools')
      .select('*')
      .eq('post_id', scheduledPost.id)
      .gt('expires_at', new Date().toISOString())
      .gt('max_recipients', 0); // Still has recipients available

    if (poolError) {
      console.error('❌ Error fetching tip pools:', poolError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!tipPools || tipPools.length === 0) {
      console.log('⚠️ No active tip pools found for post:', scheduledPost.id);
      return res.status(200).json({ 
        success: true, 
        message: 'Interaction tracked but no tips available' 
      });
    }

    console.log('💰 Found active tip pools:', tipPools.length);

    // Step 3: Get user's wallet address for tip distribution
    let userAddress = null;
    try {
      const userResponse = await fetch(`/api/get-user-by-address?fid=${user_fid}`);
      const userData = await userResponse.json();
      if (userData.success && userData.user) {
        userAddress = userData.user.verified_addresses?.eth_addresses?.[0] || 
                     userData.user.custody_address;
      }
    } catch (error) {
      console.log('⚠️ Could not fetch user address for FID:', user_fid);
    }

    // Step 4: Process each eligible tip pool
    const distributedTips = [];
    
    for (const pool of tipPools) {
      // Check if this interaction type is eligible for this pool
      const interactionTypes = pool.interaction_types || {};
      if (!interactionTypes[interaction_type]) {
        console.log(`⏭️ Skipping pool ${pool.id} - ${interaction_type} not eligible`);
        continue;
      }

      // Check if user already received a tip for this interaction type on this post
      const { data: existingInteraction } = await supabase
        .from('post_interactions')
        .select('*')
        .eq('post_id', scheduledPost.id)
        .eq('user_fid', user_fid)
        .eq('interaction_type', interaction_type)
        .single();

      if (existingInteraction) {
        console.log(`⏭️ User ${user_fid} already received tip for ${interaction_type} on post ${scheduledPost.id}`);
        continue;
      }

      // Check if pool still has recipients available
      const { data: currentInteractions } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', scheduledPost.id)
        .gt('tip_amount', 0);

      const currentRecipients = currentInteractions?.length || 0;
      if (currentRecipients >= pool.max_recipients) {
        console.log(`⏭️ Pool ${pool.id} has reached max recipients (${pool.max_recipients})`);
        continue;
      }

      // Record the interaction and tip
      const { data: newInteraction, error: interactionError } = await supabase
        .from('post_interactions')
        .insert({
          post_id: scheduledPost.id,
          cast_hash: cast_hash,
          user_fid: user_fid,
          user_address: userAddress,
          interaction_type: interaction_type,
          tip_amount: pool.amount_per_user,
          tip_token: pool.token_symbol,
          tip_claimed: false
        })
        .select()
        .single();

      if (interactionError) {
        console.error('❌ Error recording interaction:', interactionError);
        continue;
      }

      // Update pool statistics
      await supabase
        .from('tip_pools')
        .update({
          total_claimed: (parseFloat(pool.total_claimed) + parseFloat(pool.amount_per_user)).toString()
        })
        .eq('id', pool.id);

      distributedTips.push({
        pool_id: pool.id,
        token: pool.token_symbol,
        amount: pool.amount_per_user,
        interaction_id: newInteraction.id
      });

      console.log(`✅ Distributed ${pool.amount_per_user} ${pool.token_symbol} to user ${user_fid}`);
    }

    return res.status(200).json({
      success: true,
      message: `Interaction tracked and ${distributedTips.length} tips distributed`,
      distributed_tips: distributedTips,
      post_id: scheduledPost.id
    });

  } catch (error) {
    console.error('💥 Error tracking interaction:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
