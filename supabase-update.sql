-- Update existing tables to match code expectations

-- Add missing column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop and recreate scheduled_posts table with correct schema
DROP TABLE IF EXISTS public.scheduled_posts CASCADE;
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
