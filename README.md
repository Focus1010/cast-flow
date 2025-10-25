#  Cast Flow

### Schedule your Farcaster content and reward your community with on-chain micro-tips

Cast Flow is a decentralized Farcaster mini-app that empowers creators to schedule their posts in advance and build engaged communities through a sophisticated tipping system. Built on the Base network, it combines content management with Web3 incentives to create meaningful interactions.

---

## 🌟 Overview

Managing a consistent presence on Farcaster while rewarding your most engaged followers shouldn't be complicated. Cast Flow solves this by offering an intuitive scheduling system paired with customizable tip pools that automatically distribute rewards based on user interactions.

Whether you're a creator looking to maintain consistent posting schedules or someone who wants to incentivize community engagement, Cast Flow provides the tools to make it happen all within a beautiful, mobile-optimized interface designed specifically for the Farcaster ecosystem.

---

## ✨ Key Features

### 📅 Smart Post Scheduling
- **Cast/Thread Composer**: Create multi-post threads with individual text and images
- **Flexible Timing**: Schedule posts days or weeks in advance
- **Automated Posting**: GitHub Actions-powered cron jobs ensure reliable post delivery every 15 minutes
- **Unlimited Scheduling**: Schedule as many posts as you need

### 💰 Micro-Tipping System
- **Customizable Tip Pools**: Set up rewards for any scheduled post
- **Multi-Token Support**: Distribute tips in ETH, USDC, or custom tokens
- **Interaction Triggers**: Reward users for likes, recasts, or comments
- **Auto-Refund Protection**: Unclaimed tips automatically refund after 30 days

### 🎯 Token-Gated Access
- **Enhanced Features**: Token holders get premium access and benefits
- **Multi-Token Support**: Integrate your project's token for exclusive features

### 👤 User Profiles & Leaderboard
- **Tip Management**: Claim earned tips directly from your profile
- **Community Rankings**: Leaderboard showcases top contributors
- **Wallet Integration**: Seamless Base network wallet connection

---

## 🚀 How It Works

### **Complete Workflow**

#### **1. Initial Setup** 🔐
- **Connect Wallet**: Open Cast Flow in Farcaster and it autoconnect your Base wallet via Wagmi
- **Authentication**: Your Farcaster ID (FID) and wallet address are automatically detected
- **Create Signer**: One-time setup to grant Cast Flow permission to post on your behalf through Warpcast
- **Profile Created**: Your user profile is stored in Supabase with your FID and signer credentials

#### **2. Schedule Your Content** ✍️
- **Compose Cast/Thread**: Create multi-post threads (2+ posts) with rich text content
- **Add Images**: Upload images for each post via Supabase Storage
- **Set Date & Time**: Choose exactly when you want your content to go live
- **Save to Database**: Posts are saved with status "scheduled" in Supabase

#### **3. Automated Posting** ⚡
- **GitHub Actions**: A cron job runs every 15 minutes checking for due posts
- **Smart Processing**: Fetches all posts where `scheduled_time <= now` and `status = 'scheduled'`
- **Publish to Farcaster**: Uses Neynar API with your signer to publish casts
- **Update Status**: Post status changes to "posted" and `cast_hash` is stored for tracking
- **Manual Override**: Use "Process Now" button to post immediately without waiting

#### **4. Configure Tip Pools** (Optional) 💰
- **Select Post**: Choose from your scheduled posts in the Tips page
- **Set Rewards**: Configure token type (ETH, USDC, or custom tokens) and amounts
- **Define Triggers**: Set interaction requirements (likes, recasts, comments)
- **Smart Contract**: Tip pool data is linked to the CastFlow  contract which will be deployed on Base
- **Auto-Expiry**: Unclaimed tips automatically refund after 30 days

#### **5. Track Engagement** 📊
- **Interaction Monitoring**: Track who engages with your posts via Farcaster frames (in development)
- **Eligibility System**: Users who meet trigger conditions become eligible for tips
- **Leaderboard**: View top contributors and engagement metrics
- **Real-time Updates**: Status page shows all your scheduled and posted content

#### **6. Claim Rewards** 🎁
- **View Balance**: Check claimable amounts in your profile (ETH, USDC, custom tokens)
- **One-Click Claim**: Click claim button for any token with available balance
- **Smart Contract**: Direct interaction with Base network to transfer tokens
- **Instant Update**: Claimed amount resets to 0 after successful transaction

#### **7. Token-Gated Access** 🔑
- **Auto-Detection**: System checks your wallet for specific token holdings
- **Enhanced Features**: Token holders get premium benefits and unlimited access (In Development)
- **Multi-Token**: Support for custom project tokens, and more

---

### **For Different User Types**

**Content Creators:**
- Schedule unlimited posts in advance
- Set up tip pools to reward engaged followers
- Track top users on leaderboard
- Claim tips from your community

**Community Members:**
- Engage with posts (like, recast, comment)
- Earn tips automatically for interactions
- Claim accumulated rewards anytime
- Compete on leaderboard rankings

**Token Holders:**
- Get enhanced platform features
- Access exclusive benefits
- Bypass standard limitations (All these will be implemented in the future)

**Admins:**
- Manage token-gating configuration
- Monitor system health
- Configure access requirements
- Track platform metrics

---

## 🏗️ Architecture

Cast Flow is built with a modern Web3 stack optimized for the Farcaster ecosystem:

### **Frontend Layer**
- **Framework**: Next.js 15 (Pages Router) with React 19
- **Styling**: Tailwind CSS 4 for responsive, mobile-first design
- **State Management**: 
  - React Context API (`AuthContext`) for authentication
  - Wagmi hooks for wallet state
  - React useState/useEffect for component state
- **Wallet Integration**: Wagmi v2 + Viem for Base network interactions
- **Farcaster Integration**: `@farcaster/miniapp-sdk` for frame compatibility

### **Backend & Infrastructure**
- **Database**: Supabase (PostgreSQL) with Row Level Security
  - `users` - User profiles with FID and signer data
  - `scheduled_posts` - Post queue with status tracking
  - `tip_pools` - Tip configuration and distribution data
  - `token_gating_config` - Admin-managed access requirements
- **Storage**: Supabase Storage (`post-images` bucket) for media uploads
- **Authentication**: 
  - Farcaster SDK for FID detection
  - Wagmi for wallet connection
  - Neynar API for user data enrichment
- **Automation**: GitHub Actions cron job (every 15 minutes)

### **Blockchain Layer**
- **Network**: Base (Ethereum L2) - Low gas fees, EVM compatible
- **Smart Contracts**: 
  - `CastFlowTippingV3.sol` - Manages tip pools, claims, refunds
  - ReentrancyGuard & Pausable for security
  - Multi-token support (ETH, USDC, ERC20)
- **Wallet Library**: ethers.js v6 for contract interactions
- **APIs**: 
  - Neynar API for casting and user lookup
  - Base RPC for blockchain queries

### **Key Integrations**

**Farcaster Ecosystem:**
```
Farcaster Mini App SDK → User Detection → Neynar API → 
Signer Creation → Warpcast Approval → Automated Posting
```

**Scheduling System:**
```
User Input → Supabase DB → GitHub Actions Cron → 
API Route Check → Neynar Post → Status Update → Cast Hash Stored
```

**Tipping Flow:**
```
Creator Sets Pool → Smart Contract Deployment → 
User Interactions → Eligibility Tracking → 
Profile Claim UI → Contract Call → Token Transfer
```

### **Data Flow Diagram**

```
┌─────────────────┐
│  Farcaster App  │ (User accesses via Warpcast/Mobile)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │ (Frontend - Scheduler, Tips, Profile)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ Wagmi  │ │ Supabase │ (Wallet + Database)
└───┬────┘ └─────┬────┘
    │            │
    │            ▼
    │     ┌─────────────┐
    │     │GitHub Actions│ (Cron every 15min)
    │     └──────┬──────┘
    │            │
    │            ▼
    │     ┌────────────┐
    │     │ Neynar API │ (Post to Farcaster)
    │     └──────┬─────┘
    │            │
    │            ▼
    │     ┌──────────────┐
    │     │  Farcaster   │ (Posts published)
    │     └──────────────┘
    │
    ▼
┌──────────────┐
│ Base Network │ (Tips & Token Gating)
└──────────────┘
```

### **File Structure**

```
cast-flow/
├── pages/
│   ├── scheduler.js          # Post composer UI
│   ├── tips.js              # Tip pool configuration
│   ├── profile.js           # User profile & claim UI
│   ├── leaderboard.js       # Community rankings
│   ├── admin.js             # Token-gating management
│   └── api/
│       ├── schedule.js      # Save scheduled posts
│       ├── create-signer.js # Neynar signer creation
│       ├── upload-image.js  # Supabase storage
│       ├── claimable-tips.js # Fetch user tips
│       └── cron/
│           └── process-scheduled-posts.js # Auto-posting
├── components/
│   ├── Layout.js            # App shell
│   ├── BottomNavigation.js  # Mobile nav
│   └── TipPoolManager.js    # Tip configuration
├── lib/
│   ├── farcaster.js         # SDK initialization
│   ├── supabase.js          # DB client
│   └── wagmi.js             # Wallet config
├── utils/
│   ├── tippingContract.js   # Smart contract helpers
│   └── tokenGating.js       # Access control logic
└── contracts/
    └── CastFlowTippingV3.sol # Solidity contract
```

### **Security Features**

- ✅ Row Level Security on Supabase tables
- ✅ CRON_SECRET for webhook protection
- ✅ Smart contract ReentrancyGuard & Pausable
- ✅ Admin-only routes with FID verification
- ✅ Secure signer storage (which will never be never exposed to client)
- ✅ Environment variable validation

---

## 🎥 Demo

*(https://youtube.com/shorts/rlq8Adm-MrY?feature=share)*


---

## 💻 Installation & Running Locally

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Neynar API key
- Base network wallet (for testing tips)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cast-flow.git
   cd cast-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_ADMIN_FID=your_farcaster_fid
   NEYNAR_API_KEY=your_neynar_key
   CRON_SECRET=your_secret_string
   ```

4. **Set up Supabase database**
   ```bash
   # Run the schema file in your Supabase SQL editor
   # File: supabase-enhanced-schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Deploying to Production

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Vercel and setting up automated posting.

---

## 🗺️ Roadmap & Milestones

### ✅ Completed
- [x] Core scheduling functionality with thread support
- [x] Multi-token tipping smart contract (CastFlowTippingV3)
- [x] GitHub Actions automation for reliable posting
- [x] Mobile-optimized Farcaster mini-app interface
- [x] Token-gated access system
- [x] Admin panel for system management
- [x] Leaderboard and user profiles

### 🚧 In Progress
- [ ] Smart contract deployment to Base mainnet
- [ ] Frame integration for in-feed interaction tracking
- [ ] Enhanced analytics dashboard

### 🔮 Future Plans
- [ ] AI-powered content suggestions
- [ ] Cross-platform scheduling (Twitter, Lens, etc.)
- [ ] NFT rewards for top contributors
- [ ] Advanced scheduling features (best time to post, engagement predictions)
- [ ] Team collaboration tools
- [ ] Multi-language support

---

## 👥 Team & Builder Info

### Builder
**Web3Focus** - Farcaster enthusiast and Web3 builder passionate about creating tools that empower content creators and communities.

**Connect:**
- Farcaster: [@web3focus]
- GitHub: [Focus1010]
- Discord: [Focus3547]
- Twitter: [@justfocus672]
- Twitter: [@castflowapp]


### Built With Love For
- The Farcaster community
- Content creators seeking better scheduling tools
- Communities exploring on-chain engagement incentives

### Acknowledgments
- Farcaster team for the amazing protocol and Mini App SDK
- Neynar for robust API infrastructure
- Base team for the scalable L2 solution
- Everyone in the Farcaster developer community

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
Permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, subject to the following conditions:

- The above copyright notice and this permission notice shall be included in all copies
- The software is provided "as is" without warranty of any kind

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or code contributions, we appreciate your help in making Cast Flow better.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support & Contact

Having issues or questions?
- Open an issue on GitHub
- Reach out on Farcaster
- Check the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for common setup issues

---

**Made with ❤️ for the Base App and Farcaster community**
