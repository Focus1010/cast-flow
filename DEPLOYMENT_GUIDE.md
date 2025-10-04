# Cast Flow Deployment Guide

## 🚀 Quick Setup Checklist

### 1. Deploy Smart Contract
1. **Open Remix IDE**: https://remix.ethereum.org/
2. **Create new file**: `CastFlowTipping.sol`
3. **Copy contract code** from `contracts/CastFlowTipping.sol`
4. **Compile** with Solidity 0.8.19+
5. **Deploy to Base network**:
   - Network: Base (Chain ID: 8453)
   - RPC: https://mainnet.base.org
6. **Copy deployed contract address**

### 2. Update Environment Variables

#### Vercel Dashboard:
```env
NEYNAR_API_KEY=your_neynar_api_key
CRON_SECRET=cast-flow-secure-key-2024
NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS=0x_your_deployed_contract_address
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_ENB_ADDRESS=your_enb_token_address
```

#### GitHub Repository Secrets:
```env
VERCEL_URL=https://your-app.vercel.app
CRON_SECRET=cast-flow-secure-key-2024
```

### 3. Create Supabase Storage Bucket
1. **Go to Supabase Dashboard** → Storage
2. **Create bucket**: `post-images`
3. **Make it public** ✅
4. **Set policies**:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');
```

### 4. Test Everything
1. **GitHub Actions**: Go to Actions tab → Run "Auto Post Scheduler"
2. **Profile Page**: Should load without "table not found" error
3. **Scheduler**: Create a test post with image
4. **Packages**: Connect wallet and test purchase flow

## 🎯 Features Now Working

### ✅ Automatic Posting
- **GitHub Actions** runs every 15 minutes
- **Posts scheduled content** to Farcaster via Neynar
- **Status tracking** (scheduled → posted/failed)
- **Manual "Process Now"** button

### ✅ Enhanced Tipping System
- **Multi-token support**: ETH, USDC, ENB
- **Package purchasing** with USDC
- **Individual claiming** buttons for each token
- **Platform fee** collection (2.5%)
- **Ready for Cast Flow token** integration

### ✅ Image Upload
- **One image per thread post**
- **Supabase Storage** integration
- **Public access** for Farcaster embeds

### ✅ User Management
- **Automatic user creation**
- **Farcaster profile** integration
- **Monthly usage** tracking
- **Package limits** enforcement

## 🔧 Contract Functions

### For Users:
- `tipETH(address to, string postId)` - Send ETH tip
- `tipToken(address to, address token, uint256 amount, string postId)` - Send token tip
- `purchasePackage(uint256 packageId)` - Buy posting package
- `claimETH()` - Claim ETH tips
- `claimToken(address token)` - Claim token tips

### For Admin:
- `addToken(address, string, uint256)` - Add new supported token
- `setCastFlowToken(address)` - Set your future token
- `addPackage(string, uint256, uint256)` - Add new package
- `setPlatformFee(uint256)` - Update platform fee

## 🚨 Important Notes

1. **Deploy contract first** before updating environment variables
2. **Test on Base testnet** before mainnet deployment
3. **Set proper ENB token address** when available
4. **Add Cast Flow token** when it launches via `setCastFlowToken()`
5. **GitHub Actions** needs both secrets to work properly

## 🎉 Your App Is Ready!

After following these steps, your Cast Flow app will have:
- ✅ Reliable automatic posting every 15 minutes
- ✅ Complete tipping system with multiple tokens
- ✅ Package purchasing system
- ✅ Image upload functionality
- ✅ User profiles and management
- ✅ Future-ready for your Cast Flow token

Deploy the contract and update the environment variables to go live! 🚀
