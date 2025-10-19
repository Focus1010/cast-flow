# ⚡ Cast Flow

### Schedule your Farcaster content and reward your community with on-chain micro-tips

Cast Flow is a decentralized Farcaster mini-app that empowers creators to schedule their posts in advance and build engaged communities through a sophisticated tipping system. Built on the Base network, it combines content management with Web3 incentives to create meaningful interactions.

---

## 🌟 Overview

Managing a consistent presence on Farcaster while rewarding your most engaged followers shouldn't be complicated. Cast Flow solves this by offering an intuitive scheduling system paired with customizable tip pools that automatically distribute rewards based on user interactions.

Whether you're a creator looking to maintain consistent posting schedules or someone who wants to incentivize community engagement, Cast Flow provides the tools to make it happen—all within a beautiful, mobile-optimized interface designed specifically for the Farcaster ecosystem.

---

## ✨ Key Features

### 📅 Smart Post Scheduling
- **Thread Composer**: Create multi-post threads with individual text and images
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
- **Dynamic Configuration**: Admin panel for managing access requirements
- **Multi-Token Support**: Integrate your project's token for exclusive features

### 👤 User Profiles & Leaderboard
- **Activity Tracking**: Monitor your scheduled posts and engagement
- **Tip Management**: Claim earned tips directly from your profile
- **Community Rankings**: Leaderboard showcases top contributors
- **Wallet Integration**: Seamless Base network wallet connection

---

## 🚀 How It Works

### For Content Creators

1. **Connect Your Wallet**: Link your Farcaster account and Base wallet
2. **Create a Signer**: Grant Cast Flow permission to post on your behalf
3. **Compose Your Thread**: Write your content and upload images
4. **Set Your Schedule**: Choose when you want your posts to go live
5. **Configure Tips** (Optional): Create reward pools to incentivize engagement
6. **Relax**: Your content posts automatically while you focus on building

### For Community Members

1. **Browse the Leaderboard**: See top contributors and active users
2. **Engage with Content**: Like, recast, or comment on posts with active tip pools
3. **Earn Rewards**: Automatically become eligible for tips based on your interactions
4. **Claim Your Tips**: Visit your profile to claim accumulated rewards in ETH, USDC, or other tokens

---

## 🏗️ Architecture

Cast Flow is built with a modern Web3 stack optimized for the Farcaster ecosystem:

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4 for responsive, mobile-first design
- **State Management**: Wagmi for wallet interactions, Valtio for global state
- **Farcaster Integration**: Official Farcaster Mini App SDK

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Storage**: Supabase Storage for image uploads
- **Authentication**: Multi-method auth (Farcaster SDK + Wagmi)
- **Automation**: GitHub Actions for scheduled post processing

### Blockchain
- **Network**: Base (Ethereum L2)
- **Smart Contracts**: CastFlowTippingV3.sol for tip pool management
- **APIs**: Neynar API for Farcaster operations

### Data Flow
```
User Creates Post → Supabase DB → GitHub Actions (15min intervals) →
Neynar API → Farcaster Network → Post Published →
Interactions Tracked → Tips Distributed → Users Claim on Base
```

---

## 🎥 Demo

*Coming Soon: Live demo link and walkthrough video*

**Screenshots:**
- Scheduler interface with thread composer
- Tip pool configuration panel
- User profile with claimable rewards
- Mobile-optimized leaderboard

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

**Made with ⚡ for the Farcaster community**
