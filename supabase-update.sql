-- Cast Flow Enhanced Workflow Database Updates

-- Add on-chain scheduling columns to scheduled_posts
ALTER TABLE scheduled_posts 
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS commitment_tx TEXT,
ADD COLUMN IF NOT EXISTS commitment_fee TEXT DEFAULT '0.01',
ADD COLUMN IF NOT EXISTS on_chain_post_id BIGINT;

-- Create tip_pools table for managing tip configurations per post
CREATE TABLE IF NOT EXISTS tip_pools (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  creator_fid TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  amount_per_user DECIMAL(18,6) NOT NULL,
  max_recipients INTEGER NOT NULL,
  interaction_types JSONB NOT NULL, -- {"like": true, "recast": false, "comment": true}
  total_funded DECIMAL(18,6) DEFAULT 0,
  total_claimed DECIMAL(18,6) DEFAULT 0,
  funding_tx TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
CREATE TABLE public.scheduled_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  posts TEXT[],
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  images TEXT[],
  status TEXT DEFAULT 'scheduled',
  cast_hash TEXT,
  error_message TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(fid)
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_posts table
CREATE POLICY "Users can view their own posts" ON public.scheduled_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON public.scheduled_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON public.scheduled_posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own posts" ON public.scheduled_posts
  FOR DELETE USING (true);
