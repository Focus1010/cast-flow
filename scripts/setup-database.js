// Setup database schema for Cast Flow
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🗄️ Setting up Cast Flow database...');

  try {
    // Create users table
    console.log('Creating users table...');
    await supabase.rpc('exec', { 
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          fid TEXT UNIQUE NOT NULL,
          username TEXT,
          display_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          wallet TEXT,
          signer_uuid TEXT,
          last_login TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Create scheduled_posts table
    console.log('Creating scheduled_posts table...');
    await supabase.rpc('exec', { 
      sql: `
        CREATE TABLE IF NOT EXISTS scheduled_posts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_fid TEXT NOT NULL REFERENCES users(fid),
          content TEXT NOT NULL,
          thread_posts JSONB,
          images TEXT[],
          scheduled_time TIMESTAMPTZ NOT NULL,
          status TEXT DEFAULT 'scheduled',
          posted_at TIMESTAMPTZ,
          cast_hash TEXT,
          error_message TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT valid_status CHECK (status IN ('scheduled', 'posted', 'failed', 'cancelled'))
        );
      `
    });

    // Create tip_pools table
    console.log('Creating tip_pools table...');
    await supabase.rpc('exec', { 
      sql: `
        CREATE TABLE IF NOT EXISTS tip_pools (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          creator_fid TEXT NOT NULL REFERENCES users(fid),
          post_id UUID REFERENCES scheduled_posts(id),
          token_address TEXT NOT NULL,
          token_symbol TEXT NOT NULL,
          amount_per_user DECIMAL NOT NULL,
          max_recipients INT NOT NULL,
          interaction_types JSONB NOT NULL,
          active BOOLEAN DEFAULT true,
          start_time TIMESTAMPTZ DEFAULT NOW(),
          end_time TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Create tip_claims table
    console.log('Creating tip_claims table...');
    await supabase.rpc('exec', { 
      sql: `
        CREATE TABLE IF NOT EXISTS tip_claims (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_fid TEXT NOT NULL REFERENCES users(fid),
          tip_pool_id UUID NOT NULL REFERENCES tip_pools(id),
          amount DECIMAL NOT NULL,
          tx_hash TEXT,
          claimed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Set up Row Level Security
    console.log('Setting up Row Level Security policies...');
    await supabase.rpc('exec', { sql: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;` });
    await supabase.rpc('exec', { sql: `ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;` });
    await supabase.rpc('exec', { sql: `ALTER TABLE tip_pools ENABLE ROW LEVEL SECURITY;` });
    await supabase.rpc('exec', { sql: `ALTER TABLE tip_claims ENABLE ROW LEVEL SECURITY;` });

    // Create policies
    console.log('Creating security policies...');
    
    // Users table policies
    await supabase.rpc('exec', { 
      sql: `
        CREATE POLICY "Users can read their own data" ON users
          FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');
          
        CREATE POLICY "Users can update their own data" ON users
          FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');
      `
    });

    // Scheduled posts policies
    await supabase.rpc('exec', { 
      sql: `
        CREATE POLICY "Users can read their own posts" ON scheduled_posts
          FOR SELECT USING (auth.uid()::text = user_fid OR auth.role() = 'service_role');
          
        CREATE POLICY "Users can create their own posts" ON scheduled_posts
          FOR INSERT WITH CHECK (auth.uid()::text = user_fid OR auth.role() = 'service_role');
          
        CREATE POLICY "Users can update their own posts" ON scheduled_posts
          FOR UPDATE USING (auth.uid()::text = user_fid OR auth.role() = 'service_role');
          
        CREATE POLICY "Users can delete their own posts" ON scheduled_posts
          FOR DELETE USING (auth.uid()::text = user_fid OR auth.role() = 'service_role');
      `
    });

    // Tip pools policies
    await supabase.rpc('exec', { 
      sql: `
        CREATE POLICY "Anyone can read tip pools" ON tip_pools
          FOR SELECT USING (true);
          
        CREATE POLICY "Users can create their own tip pools" ON tip_pools
          FOR INSERT WITH CHECK (auth.uid()::text = creator_fid OR auth.role() = 'service_role');
          
        CREATE POLICY "Users can update their own tip pools" ON tip_pools
          FOR UPDATE USING (auth.uid()::text = creator_fid OR auth.role() = 'service_role');
      `
    });

    // Create storage bucket for post images
    console.log('Setting up storage bucket for post images...');
    await supabase.rpc('exec', { 
      sql: `
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('post-images', 'post-images', true) 
        ON CONFLICT (id) DO NOTHING;
        
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
        USING (bucket_id = 'post-images');
        
        CREATE POLICY "Authenticated Users Can Upload" ON storage.objects 
        FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
      `
    });

    console.log('✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Set up your environment variables');
    console.log('2. Deploy the tipping contract using scripts/deploy-tipping-contract.js');
    console.log('3. Configure the cron job using scripts/setup-cron.js');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('\nTroubleshooting:');
    console.error('- Make sure your SUPABASE_SERVICE_KEY has full admin access');
    console.error('- If you see SQL errors, some tables might already exist');
    console.error('- Consider manually running the SQL commands in the Supabase SQL editor');
  }
}

setupDatabase();
