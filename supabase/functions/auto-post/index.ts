import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Auto-post function started")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get posts that should be published now
    const now = new Date().toISOString()
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .lte('datetime', now)
      .eq('status', 'scheduled')
      .order('datetime', { ascending: true })

    if (fetchError) throw fetchError

    let processed = 0
    const errors = []

    for (const post of scheduledPosts || []) {
      try {
        // Get user signer
        const { data: user } = await supabase
          .from('users')
          .select('signer_uuid')
          .eq('fid', post.user_id)
          .single()

        if (!user?.signer_uuid) {
          throw new Error('User signer not found')
        }

        // Prepare cast content
        const castContent = Array.isArray(post.posts) 
          ? post.posts.join('\n\n---\n\n')
          : post.posts

        // Prepare cast data
        const castData = {
          signer_uuid: user.signer_uuid,
          text: castContent
        }

        // Add images if they exist
        if (post.images && post.images.length > 0) {
          castData.embeds = post.images.map(imageUrl => ({ url: imageUrl }))
        }

        // Post via Neynar
        const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_key': Deno.env.get('NEYNAR_API_KEY') ?? '',
          },
          body: JSON.stringify(castData)
        })

        if (!response.ok) {
          throw new Error(`Neynar API error: ${response.status}`)
        }

        const result = await response.json()

        // Update post status
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'posted',
            posted_at: new Date().toISOString(),
            cast_hash: result.cast.hash
          })
          .eq('id', post.id)

        processed++

      } catch (error) {
        errors.push({ postId: post.id, error: error.message })
        
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', post.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        processed, 
        errors: errors.length > 0 ? errors : undefined 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
