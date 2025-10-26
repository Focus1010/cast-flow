# Cast Flow Deployment Guide

This guide will walk you through the process of deploying Cast Flow to production and setting up all the required services.

## Prerequisites

Before deploying, make sure you have:

1. A [Vercel](https://vercel.com) account for hosting
2. A [Supabase](https://supabase.com) account for the database
3. A [Neynar](https://neynar.com) developer account for Farcaster API access
4. A wallet with some ETH on Base network for contract deployment
5. A GitHub account (for automated cron jobs)

## Step 1: Set Up Supabase

1. Create a new Supabase project
2. Go to the SQL Editor and run the schema setup script:

```sql
-- Create tables
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

CREATE TABLE IF NOT EXISTS tip_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_fid TEXT NOT NULL REFERENCES users(fid),
  tip_pool_id UUID NOT NULL REFERENCES tip_pools(id),
  amount DECIMAL NOT NULL,
  tx_hash TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_claims ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Authenticated Users Can Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
```

3. Note your Supabase URL and anon key from the Settings → API section

## Step 2: Set Up Neynar API

1. Create a Neynar account at https://neynar.com
2. Create a new API key from the developer dashboard
3. Store this API key for your environment variables

## Step 3: Deploy the Smart Contract

1. Make sure your wallet has ETH on Base network (for gas)
2. Create a `.env` file in the project root and add your private key:

```
ADMIN_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

3. Run the deployment script:

```bash
# First compile the contracts
npx hardhat compile

# Then deploy
node scripts/deploy-tipping-contract.js
```

4. The script will output the contract address and automatically update your `.env` file

## Step 4: Deploy to Vercel

1. Push your code to a GitHub repository
2. Connect your GitHub account to Vercel
3. Import your repository
4. Configure the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
NEYNAR_API_KEY=your_neynar_api_key
NEXT_PUBLIC_ADMIN_FID=your_farcaster_id
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS=your_contract_address
CRON_SECRET=generate_a_secure_random_string
VERCEL_URL=your_vercel_app_url
```

5. Deploy with the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## Step 5: Set Up Automated Posting

### Option 1: Vercel Cron (Recommended)

1. Go to your Vercel project settings
2. Navigate to the "Cron Jobs" section
3. Add a new cron job:
   - Name: `process-scheduled-posts`
   - Schedule: `*/5 * * * *` (runs every 5 minutes)
   - Command: `curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/process-scheduled-posts`

### Option 2: GitHub Actions

1. Create a `.github/workflows` directory in your repository
2. Add a file named `process-posts.yml`:

```yaml
name: Process Scheduled Posts

on:
  schedule:
    - cron: '*/5 * * * *' # Run every 5 minutes

jobs:
  process-posts:
    runs-on: ubuntu-latest
    steps:
      - name: Call process endpoint
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/cron/process-scheduled-posts
```

3. Add `CRON_SECRET` to your GitHub repository secrets with the same value as your Vercel environment variable

## Step 6: Test Your Deployment

1. Visit your deployed app
2. Connect your Farcaster account
3. Schedule a test post for a few minutes in the future
4. Wait for the cron job to run and verify the post appears on Farcaster

## Troubleshooting

### Common Issues

1. **Posts not being published:**
   - Check your cron job is running (Vercel logs or GitHub Actions)
   - Verify the CRON_SECRET matches in both places
   - Make sure your Neynar API key is correct

2. **Smart contract issues:**
   - Confirm your wallet has ETH for gas
   - Check transaction status on Basescan
   - Verify the contract address is correct in your environment variables

3. **Database issues:**
   - Check Supabase logs for errors
   - Verify your row level security policies
   - Make sure your service key has the proper permissions

## Maintenance

Once deployed, monitor the following:

1. Supabase storage usage (for post images)
2. Base network gas costs for contract interactions
3. Neynar API usage limits
4. Vercel serverless function limits

Regular backups of your database are recommended.

## Support

If you encounter any issues during deployment, please:

1. Open an issue on GitHub
2. Reach out to the team on Farcaster (@web3focus)
3. Check our Discord community for help

---

Good luck with your deployment! Once complete, you'll have a fully functional Cast Flow application where users can schedule posts and participate in the tipping system.
