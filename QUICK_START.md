# Cast Flow Quick Start Guide

This guide will help you get Cast Flow up and running quickly with all features working correctly.

## 1. Initial Setup

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Fill in these essential variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   NEYNAR_API_KEY=your_neynar_api_key
   NEXT_PUBLIC_ADMIN_FID=your_farcaster_id
   ```

### Database Setup

Run the setup script to create all necessary tables:

```bash
npm run setup
```

This creates the required tables with proper security policies:
- `users` - For storing user profiles and signer credentials
- `scheduled_posts` - For tracking post schedules and status
- `tip_pools` - For configuring tip rewards
- `tip_claims` - For tracking claimed tips

## 2. Smart Contract Deployment

Deploy the tipping contract to Base network:

1. Add your wallet's private key to `.env.local`:
   ```
   ADMIN_PRIVATE_KEY=your_wallet_private_key
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   ```

2. Run the deployment script:
   ```bash
   npm run deploy:contract
   ```

The script will:
- Deploy the contract to Base
- Save the address to your .env file
- Create contract ABI file in utils folder

## 3. Automated Posting Setup

Configure the cron job for automatic post processing:

```bash
npm run setup:cron
```

For production, follow one of these options:
- **Vercel**: Add a cron job in the Vercel dashboard
- **GitHub Actions**: The workflow file is already configured at `.github/workflows/process-posts.yml`

## 4. Using Cast Flow

### Scheduling Posts

1. Connect your Farcaster account
2. Create a signer (one-time setup)
3. Compose your posts with optional thread replies
4. Set date and time
5. Click "Schedule Post"

### Setting Up Tips

1. Go to the Tips tab
2. Select a scheduled post
3. Choose token type (ETH, USDC, etc.)
4. Set amount per user and max recipients
5. Select which actions to reward (likes, recasts, comments)
6. Save the tip configuration

### Claiming Tips

1. Go to Profile tab
2. Connect wallet if not connected
3. View available tips
4. Click the "Claim" button for each token type

## 5. Testing the App

### Test the Scheduler

1. Schedule a post for a few minutes from now
2. Manually process posts to verify immediate posting:
   ```bash
   npm run process:posts
   ```
3. Check Farcaster to verify post appears

### Test the Tipping System

1. Create a tip configuration for a post
2. Interact with the post (like, recast, comment)
3. Go to profile page and check for claimable tips
4. Test claiming tips with your wallet

## 6. Troubleshooting

### Posts Not Publishing

1. Check Neynar API key is valid
2. Verify user has a valid signer_uuid
3. Examine the console logs for errors
4. Check scheduled_posts table for error messages

### Tipping Issues

1. Confirm the contract is deployed properly
2. Verify wallet connections are working
3. Check Base network gas availability
4. View token balances for sufficient funds

### Database Issues

1. Verify Supabase credentials
2. Check row level security policies
3. Examine database logs for errors

## 7. Production Deployment

When ready for production:

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Set up the cron job in Vercel dashboard
3. Update the GitHub Actions secret with your production URL
4. Verify all features work in production environment

---

Need more help? Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
