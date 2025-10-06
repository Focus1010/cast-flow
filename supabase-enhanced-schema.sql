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
);

-- Create interactions table for tracking user engagement
CREATE TABLE IF NOT EXISTS post_interactions (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  cast_hash TEXT NOT NULL,
  user_fid TEXT NOT NULL,
  user_address TEXT,
  interaction_type TEXT NOT NULL, -- 'like', 'recast', 'comment'
  tip_amount DECIMAL(18,6) DEFAULT 0,
  tip_token TEXT,
  tip_claimed BOOLEAN DEFAULT FALSE,
  tip_claim_tx TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_fid, interaction_type)
);

-- Create token_holdings table for premium access management
CREATE TABLE IF NOT EXISTS token_holdings (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  user_fid TEXT,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  balance DECIMAL(18,6) NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_address, token_address)
);

-- Create admin_config table for managing unlimited access and token requirements
CREATE TABLE IF NOT EXISTS admin_config (
  id BIGSERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin configurations
INSERT INTO admin_config (config_key, config_value) VALUES 
('unlimited_access_tokens', '{"ENB": {"address": "0x...", "min_amount": "1000"}, "CASTFLOW": {"address": "0x...", "min_amount": "500"}}'),
('admin_addresses', '["0x..."]'), -- Add your admin wallet addresses
('supported_tip_tokens', '{"ETH": {"address": "0x0000000000000000000000000000000000000000", "decimals": 18}, "USDC": {"address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "decimals": 6}}')
ON CONFLICT (config_key) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tip_pools_post_id ON tip_pools(post_id);
CREATE INDEX IF NOT EXISTS idx_tip_pools_creator ON tip_pools(creator_fid);
CREATE INDEX IF NOT EXISTS idx_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON post_interactions(user_fid);
CREATE INDEX IF NOT EXISTS idx_interactions_cast ON post_interactions(cast_hash);
CREATE INDEX IF NOT EXISTS idx_token_holdings_address ON token_holdings(user_address);
CREATE INDEX IF NOT EXISTS idx_token_holdings_token ON token_holdings(token_address);

-- Add signer management columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS signer_uuid TEXT,
ADD COLUMN IF NOT EXISTS signer_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS signer_approved_at TIMESTAMP;

-- Enable RLS on new tables
ALTER TABLE tip_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own tip pools" ON tip_pools
  FOR ALL USING (creator_fid = current_setting('app.current_user_fid', true));

CREATE POLICY "Users can view interactions on their posts" ON post_interactions
  FOR SELECT USING (
    post_id IN (SELECT id FROM scheduled_posts WHERE user_id = current_setting('app.current_user_fid', true))
    OR user_fid = current_setting('app.current_user_fid', true)
  );

CREATE POLICY "System can insert interactions" ON post_interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own token holdings" ON token_holdings
  FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

CREATE POLICY "Admins can manage config" ON admin_config
  FOR ALL USING (current_setting('app.current_user_address', true) = ANY(
    SELECT jsonb_array_elements_text(config_value) 
    FROM admin_config 
    WHERE config_key = 'admin_addresses'
  ));
