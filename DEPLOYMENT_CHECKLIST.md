# 🚀 Cast Flow - Production Deployment Checklist

## ✅ **Pre-Deployment Steps**

### **1. Environment Configuration**
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `NEYNAR_API_KEY` (get from https://neynar.com/)
- [ ] Set `NEXT_PUBLIC_ADMIN_FID` (your Farcaster ID)
- [ ] Set `NEXT_PUBLIC_ADMIN_ADDRESS` (your wallet address)
- [ ] Generate secure `CRON_SECRET` (random string)

### **2. Supabase Database Setup**
```sql
-- Run this in Supabase SQL Editor:
-- 1. First run: supabase-setup.sql
-- 2. Then run: supabase-enhanced-schema.sql
```

### **3. Smart Contract Deployment**
- [ ] Deploy `CastFlowTippingSimple.sol` to Base network via Remix IDE
- [ ] Copy contract address and set `NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS` in environment
- [ ] Contract automatically makes deployer the owner and admin
- [ ] Call `setTokenAddresses()` to set ENB and Cast Flow token addresses
- [ ] Add additional admins using `addAdmin()` if needed

**Remix Deployment Steps:**
1. Go to https://remix.ethereum.org/
2. Create new file and paste `CastFlowTippingSimple.sol` content
3. Compile with Solidity ^0.8.0
4. Deploy to Base network (Chain ID: 8453)
5. Verify contract on BaseScan

### **4. GitHub Repository Setup**
- [ ] Push code to GitHub repository
- [ ] Set repository secrets in GitHub Settings > Secrets:
  - `VERCEL_URL` (will be set after Vercel deployment)
  - `CRON_SECRET` (same as in .env.local)

## 🚀 **Deployment Steps**

### **1. Deploy to Vercel**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy and get the Vercel URL
4. Update `VERCEL_URL` secret in GitHub

### **2. Configure Farcaster Frame**
1. Update `public/.well-known/farcaster.json` with your domain
2. Test frame functionality

### **3. Test Core Features**
- [ ] User authentication (wallet + Farcaster)
- [ ] Post scheduling
- [ ] Tip pool configuration
- [ ] Admin panel access (only for admins)
- [ ] Token-gated unlimited access
- [ ] GitHub Actions posting (every 15 minutes)

## 🔧 **Post-Deployment Configuration**

### **1. Admin Setup**
1. Visit `/admin` page (only visible to admins)
2. Configure unlimited access tokens:
   - Add ENB token address and minimum amount
   - Add Cast Flow token address and minimum amount
3. Add additional admin addresses if needed

### **2. Token Configuration**
Update token addresses in admin panel:
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Base)
- **ENB**: Your ENB token address
- **Cast Flow**: Your Cast Flow token address (when launched)

### **3. Monitoring**
- [ ] Check GitHub Actions are running every 15 minutes
- [ ] Monitor Supabase database for posts and interactions
- [ ] Test tip distribution system
- [ ] Verify gas fees are minimal (< 1 cent on Base)

## 🎯 **Key Features Verification**

### **✅ Core Workflow**
1. **User connects wallet** → Wagmi authentication
2. **Creates scheduled post** → Stores in Supabase (no gas fee for scheduling)
3. **Configures tip pools** → Sets rewards for engagement
4. **GitHub Actions posts** → Every 15 minutes via Neynar API
5. **Frame tracks interactions** → Automatic tip distribution
6. **Users claim tips** → Individual token buttons in profile

### **✅ Token-Gated Access**
- Users holding ENB or Cast Flow tokens get unlimited scheduling
- Admin can add/remove supported tokens dynamically
- Real-time balance checking on Base network

### **✅ Admin Features**
- Admin panel only visible to configured admins
- Token management (add/remove unlimited access tokens)
- Admin address management
- System monitoring and configuration

## 🔒 **Security Checklist**
- [ ] All environment variables properly secured
- [ ] Admin addresses correctly configured
- [ ] Smart contract deployed and verified
- [ ] RLS policies enabled in Supabase
- [ ] CRON_SECRET properly secured in GitHub

## 📱 **Mobile Optimization**
- [ ] Test on mobile devices
- [ ] Verify Farcaster mini-app compatibility
- [ ] Check responsive design
- [ ] Test wallet connections on mobile

## 🚨 **Emergency Procedures**
- **Pause contract**: Call `pause()` function as admin
- **Emergency withdraw**: Use `emergencyWithdraw()` as owner
- **Disable GitHub Actions**: Disable workflow in repository settings
- **Database issues**: Check Supabase dashboard and logs

---

## 🎉 **Ready for Launch!**

Your Cast Flow app is now production-ready with:
- ⚡ **Gas-optimized** transactions (< 1 cent on Base)
- 🔐 **Admin-only** panel visibility
- 💰 **Token-gated** unlimited access
- 🤖 **Automated** posting every 15 minutes
- 🎯 **Engagement** rewards with tip distribution
- 📱 **Mobile-first** Farcaster mini-app design

**Go live and start building your engagement economy! 🚀**
