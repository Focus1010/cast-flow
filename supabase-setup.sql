-- Create users table for Cast Flow
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  fid INTEGER UNIQUE NOT NULL,
  username TEXT,
  bio TEXT,
  wallet_address TEXT,
  monthly_used INTEGER DEFAULT 0,
  premium_expiry BIGINT,
  package_type TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id SERIAL PRIMARY KEY,
  user_fid INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  cast_hash TEXT,
  error_message TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_fid) REFERENCES users(fid)
);

-- Create thread_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.thread_posts (
  id SERIAL PRIMARY KEY,
  scheduled_post_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (scheduled_post_id) REFERENCES scheduled_posts(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (true);

-- Create policies for scheduled_posts table
CREATE POLICY "Users can view their own posts" ON public.scheduled_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON public.scheduled_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON public.scheduled_posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own posts" ON public.scheduled_posts
  FOR DELETE USING (true);

-- Create policies for thread_posts table
CREATE POLICY "Users can view thread posts" ON public.thread_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert thread posts" ON public.thread_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update thread posts" ON public.thread_posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete thread posts" ON public.thread_posts
  FOR DELETE USING (true);

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for images
CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete their images" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-images');
