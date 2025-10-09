# Cast Flow - Farcaster Mini App Mobile UI/UX Design Brief

## 🎯 **Project Overview**
**Product**: Cast Flow - A Farcaster mini app for post scheduling and micro-tips monetization  
**Target Users**: Farcaster creators and content creators who want consistent posting and engagement monetization  
**Platform**: Farcaster Mini App (Mobile-first web app that runs inside Farcaster)  
**Design Requirements**: Beautiful mobile UI with icons, fully functional components, Farcaster-compatible  
**Tech Integration**: Must integrate with existing Next.js, Privy Auth, Supabase, Wagmi codebase

## 📱 **REQUIRED PAGES TO DESIGN**

### **1. Main Scheduler Page** (Primary page - most important)
### **2. Leaderboard Page** (Top 50 tippers and schedulers)
### **3. Tips Configuration Page** (Micro-tips setup)
### **4. Profile Page** (User dashboard)
### **5. Admin Page** (Admin-only features)
### **6. Packages Page** (Subscription tiers)

## 📱 **Core User Flows**

### **Flow 1: First-Time User Onboarding**
```
Entry Point → Authentication → Dashboard Discovery → First Post Schedule
```

**Screens:**
1. **Landing/Splash Screen**
   - App logo "Cast Flow" with tagline
   - "Connect Wallet" CTA button
   - Brief value proposition text

2. **Authentication Screen**
   - Privy-powered Farcaster connection
   - Permission requests explanation
   - Loading states during connection

3. **Welcome Dashboard**
   - Quick tour of features
   - Package status display (Free plan)
   - Empty state with "Schedule Your First Post" CTA

### **Flow 2: Core Scheduling Workflow**
```
Post Creation → Thread Building → Time Selection → Scheduling → Management
```

**Screens:**
1. **Post Composer**
   - Multi-post thread interface
   - Character counter per post
   - "Add Another Post" functionality
   - Rich text preview

2. **Schedule Configuration**
   - Custom datetime picker (dark themed)
   - Timezone display
   - Package usage indicator
   - Validation messages

3. **Confirmation & Management**
   - Scheduled posts list
   - Quick actions (Post Now, Delete, Edit)
   - Status indicators

### **Flow 3: Micro-Tips Setup**
```
Post Selection → Token Configuration → Engagement Rules → Activation
```

**Screens:**
1. **Tips Configuration**
   - Post selection dropdown
   - Token type selector (ETH, USDC, FCS, ENB)
   - Amount input with USD conversion
   - Engagement rule checkboxes

2. **Active Tips Management**
   - List of active configurations
   - Performance metrics
   - Edit/Delete actions

### **Flow 4: Package Upgrade**
```
Limit Reached → Package Comparison → Payment → Confirmation
```

**Screens:**
1. **Package Selection**
   - Tier comparison cards
   - Feature highlights
   - Pricing in USDC
   - Current usage display

2. **Payment Flow**
   - Wallet connection confirmation
   - Transaction preview
   - Success/failure states

## 🎨 **Design System Specifications**

### **Color Palette**
```css
Primary Background: #0f172a (Dark slate)
Secondary Background: #0b1220 (Darker card background)
Glass Background: rgba(255, 255, 255, 0.08)
Glass Border: rgba(255, 255, 255, 0.15)

Primary Accent: #7c3aed (Purple gradient start)
Secondary Accent: #4f46e5 (Purple gradient end)
Text Primary: #e6eef8 (Light blue-white)
Text Muted: #94a3b8 (Slate gray)

Success: #10b981 (Emerald)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
```

### **Typography**
```css
Font Family: 'Inter', system-ui, -apple-system, sans-serif
Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

Headings: 
- H1: 28px, weight 800, gradient text effect
- H2: 24px, weight 700
- H3: 20px, weight 600

Body Text: 14px, weight 400, line-height 1.6
Small Text: 12px, weight 400
Button Text: 14px, weight 500
```

### **Component Specifications**

#### **Cards**
```css
Background: Glass morphism effect
Border Radius: 14px
Padding: 18px
Border: 1px solid glass-border
Backdrop Filter: blur(10px)
Box Shadow: 0 8px 24px rgba(0, 0, 0, 0.4)
Hover Effect: translateY(-4px) + enhanced shadow
```

#### **Buttons**
```css
Primary Button:
- Background: Linear gradient (#7c3aed to #4f46e5)
- Padding: 8px 14px
- Border Radius: 8px
- Color: White
- Font Weight: 500
- Hover: Darker gradient + slight scale

Ghost Button:
- Background: Transparent
- Border: 1px solid glass-border
- Color: Muted text
- Hover: Glass background + accent color text
```

#### **Input Fields**
```css
Background: Card background
Border: 1px solid glass-border
Border Radius: 8px
Padding: 10px
Color: Primary text
Focus State: Purple border + glow effect
Placeholder: Muted text color
```

#### **Navigation**
```css
Desktop: Horizontal nav with links + auth button
Mobile: Hamburger menu with slide-out drawer
Menu Background: Card background with blur
Menu Items: Full-width touch targets (44px min height)
Active State: Purple accent background
```

## 📱 **DETAILED PAGE SPECIFICATIONS**

### **PAGE 1: MAIN SCHEDULER** 🏠 (Home Tab - Most Important)
**Purpose**: Core functionality - schedule Farcaster posts with threads
**Mobile Layout**: Single column, optimized for thumb navigation, bottom tab navigation

#### **Header Section**
- **Title**: "Cast Flow" with gradient purple text effect
- **User Avatar**: Small circular profile pic (top right)
- **Notification Bell**: 🔔 Bell icon for updates (top right)

#### **Package Status Banner**
- **Background**: Subtle gradient card
- **Icon**: 📦 Package icon
- **Text**: "Free Plan - 3/10 posts used this month"
- **Action**: "Upgrade" button (if applicable)

#### **Post Composer Section**
- **Thread Builder**: 
  - Multiple text areas for thread posts
  - Character counter per post (280 chars max)
  - "Add Another Post" button with ➕ icon
  - Delete post button with 🗑️ icon for each post
- **Rich Text Preview**: Show how posts will appear
- **Media Upload**: 📷 Camera icon for images (future feature)

#### **Scheduling Section**
- **Label**: "📅 Schedule Time" with calendar icon
- **DateTime Picker**: Custom dark-themed picker
- **Timezone Display**: User's current timezone
- **Quick Options**: "Post Now", "1 Hour", "Tomorrow" buttons

#### **Action Button**
- **Primary CTA**: "Schedule Post" (full-width, purple gradient)
- **Loading State**: Spinner + "Scheduling..." text
- **Success State**: Checkmark animation

#### **Scheduled Posts List**
- **Header**: "Scheduled Posts" with count badge
- **Empty State**: Illustration + "No scheduled posts yet"
- **Post Cards**: 
  - Post preview (truncated)
  - Scheduled time with 🕐 clock icon
  - Status indicator (scheduled/posted/failed)
  - Actions: "Post Now" ⚡, "Edit" ✏️, "Delete" 🗑️

#### **Icons Needed**:
- 📅 Calendar, 🕐 Clock, ➕ Add, 🗑️ Delete, ✏️ Edit, ⚡ Post Now, 📦 Package, 📷 Camera

---

### **PAGE 2: LEADERBOARD** 🏆 (Leaderboard Tab)
**Purpose**: Show top 50 users by tips given/received and posts scheduled
**Mobile Layout**: List-based with filters, bottom tab navigation

#### **Header Section**
- **Title**: "🏆 Leaderboard" 
- **Subtitle**: "Top Farcaster Creators"
- **Filter Tabs**: "Top Tippers" | "Top Schedulers" | "Most Active"

#### **Ranking List**
- **Rank Badge**: #1, #2, #3 with special styling for top 3
- **User Card**: 
  - Profile picture (circular)
  - Username with Farcaster verification badge
  - FID number
  - Stats: Tips given 💰, Posts scheduled 📝, Engagement 💖
- **Your Rank**: Highlighted card showing user's position

#### **Stats Cards** (Top section)
- **Total Tips**: 💰 "$12,450 distributed"
- **Active Users**: 👥 "1,234 creators"
- **Posts Scheduled**: 📝 "5,678 this month"

#### **Icons Needed**:
- 🏆 Trophy, 💰 Money, 📝 Posts, 💖 Heart, 👥 Users, ⭐ Star, 🥇🥈🥉 Medals

---

### **PAGE 3: TIPS CONFIGURATION** 💰 (Tips Tab)
**Purpose**: Set up micro-tips for engagement on scheduled posts
**Mobile Layout**: Form-based with clear sections, bottom tab navigation

#### **Header Section**
- **Title**: "💰 Micro-Tips Setup"
- **Subtitle**: "Reward engagement on your posts"

#### **Post Selection**
- **Label**: "Choose Post to Tip"
- **Dropdown**: List of scheduled posts with preview
- **Empty State**: "No scheduled posts available"

#### **Token Configuration**
- **Label**: "Select Token"
- **Token Grid**: 4 token cards (ETH, USDC, FCS, ENB)
- **Each Token Card**:
  - Token icon and symbol
  - Current balance
  - USD value
  - Selection indicator

#### **Amount Settings**
- **Tip Amount**: Input field with token symbol
- **USD Equivalent**: Real-time conversion display
- **Max Recipients**: Number input with stepper
- **Total Budget**: Calculated display

#### **Engagement Rules**
- **Section Title**: "Reward For"
- **Toggle Switches**:
  - 👍 Likes (with count threshold)
  - 🔄 Reposts (with count threshold)  
  - 💬 Comments (with count threshold)
- **Advanced**: Quality filters toggle

#### **Active Configurations**
- **List**: Current tip configurations
- **Each Config Card**:
  - Post preview
  - Token and amount
  - Engagement rules
  - Performance stats
  - Edit/Delete actions

#### **Icons Needed**:
- 💰 Money, 👍 Like, 🔄 Repost, 💬 Comment, ⚙️ Settings, 📊 Stats

---

### **PAGE 4: PROFILE** 👤 (Profile Tab)
**Purpose**: User dashboard with stats and settings
**Mobile Layout**: Card-based information display, bottom tab navigation

#### **User Info Section**
- **Profile Header**:
  - Large profile picture
  - Username and display name
  - Farcaster verification badge
  - FID number
  - Bio text

#### **Stats Cards Grid**
- **Posts Scheduled**: 📝 Count with trend arrow
- **Tips Received**: 💰 Total value in USD
- **Tips Given**: 🎁 Total value in USD  
- **Engagement Rate**: 📈 Percentage with chart
- **Followers Impact**: 👥 Reach metrics

#### **Wallet Information**
- **Connected Wallet**: Address with copy button
- **Token Balances**: ETH, USDC, FCS, ENB with icons
- **Transaction History**: Recent tips and payments

#### **Package Information**
- **Current Plan**: Plan name with features
- **Usage**: Progress bar showing posts used
- **Renewal Date**: Next billing cycle
- **Upgrade Button**: If applicable

#### **Settings Section**
- **Notifications**: 🔔 Toggle switches
- **Privacy**: 🔒 Privacy settings
- **Timezone**: 🌍 Time zone selection
- **Export Data**: 📤 Download user data
- **Disconnect**: 🚪 Logout button

#### **Icons Needed**:
- 👤 Profile, 📝 Posts, 💰 Money, 🎁 Gift, 📈 Chart, 👥 Users, 🔔 Bell, 🔒 Lock, 🌍 Globe, 📤 Export, 🚪 Exit

---

### **PAGE 5: MORE PAGE** ⚙️ (More Tab)
**Purpose**: Additional features and settings menu
**Mobile Layout**: Menu list with navigation options

#### **Menu Options**
- **💎 Packages** - Subscription plans (navigates to packages page)
- **⚡ Admin** - Admin dashboard (only visible to admin users)
- **🔗 Connect Wallet** / **🚪 Disconnect** - Auth button
- **📋 Help & Support** - Support resources
- **📄 Terms & Privacy** - Legal documents
- **🌍 Language** - Language selection
- **🔔 Notifications** - Notification settings

---

### **PAGE 6: ADMIN PAGE** ⚡ (Admin Only - Accessed from More tab)
**Purpose**: Admin controls and system management
**Mobile Layout**: Dashboard with admin tools, only visible to admin users

#### **Admin Dashboard**
- **Title**: "⚡ Admin Dashboard"
- **Quick Stats**:
  - Total Users: 👥 Count
  - Revenue: 💰 Monthly revenue
  - Posts Scheduled: 📝 Total count
  - System Health: 🟢 Status indicator

#### **User Management**
- **User Search**: Search bar with filters
- **User List**: 
  - Profile info
  - Package type
  - Usage stats
  - Admin actions (suspend, upgrade, etc.)

#### **System Controls**
- **Scheduled Posts**: View all scheduled posts
- **Tips Monitoring**: Monitor tip distributions
- **Revenue Tracking**: Payment and subscription metrics
- **System Settings**: Configuration options

#### **Analytics Dashboard**
- **Charts**: Usage trends, revenue graphs
- **Reports**: Downloadable reports
- **Alerts**: System notifications

#### **Icons Needed**:
- ⚡ Admin, 👥 Users, 💰 Revenue, 📊 Analytics, ⚙️ Settings, 🚨 Alert, 📈 Growth

---

### **PAGE 7: PACKAGES** 💎 (Accessed from More tab)
**Purpose**: Subscription tier selection and payment
**Mobile Layout**: Card comparison with clear CTAs

#### **Header Section**
- **Title**: "💎 Choose Your Plan"
- **Subtitle**: "Scale your Farcaster presence"

#### **Package Cards** (Vertical stack on mobile)
- **Free Tier**:
  - "🆓 Free" badge
  - "10 posts/month"
  - Basic features list
  - "Current Plan" or "Downgrade" button

- **Starter Tier**:
  - "🚀 Starter" badge  
  - "$5 USDC/month"
  - "15 posts/month"
  - Feature list with checkmarks
  - "Upgrade" button

- **Pro Tier**:
  - "⭐ Pro" badge
  - "$10 USDC/month" 
  - "30 posts/month"
  - Enhanced features
  - "Most Popular" banner
  - "Upgrade" button

- **Elite Tier**:
  - "👑 Elite" badge
  - "$20 USDC/month"
  - "60 posts/month" 
  - Premium features
  - "Upgrade" button

#### **Payment Flow**
- **Payment Method**: Connected wallet display
- **Transaction Preview**: Cost breakdown
- **Confirmation**: Success/failure states

#### **Icons Needed**:
- 💎 Diamond, 🆓 Free, 🚀 Rocket, ⭐ Star, 👑 Crown, ✅ Checkmark, 💳 Payment

## 🔄 **Interaction Patterns**

### **Loading States**
- Skeleton screens for content loading
- Spinner for quick actions
- Progress bars for file uploads
- Shimmer effects for list items

### **Empty States**
- Friendly illustrations
- Clear CTAs to get started
- Helpful tips and guidance
- Links to relevant help content

### **Error States**
- Clear error messages
- Retry mechanisms
- Fallback options
- Contact support links

### **Success States**
- Confirmation animations
- Clear success messages
- Next step suggestions
- Share functionality

## 📐 **Responsive Breakpoints**

### **Mobile (320px - 768px)**
- Single column layout
- Full-width components
- Touch-optimized interactions
- Hamburger navigation
- Bottom-sheet modals

### **Tablet (768px - 1024px)**
- Two-column layout where appropriate
- Larger touch targets
- Side navigation option
- Modal dialogs

### **Desktop (1024px+)**
- Multi-column layouts
- Hover states
- Keyboard navigation
- Full navigation bar
- Larger content areas

## 🎯 **Key UX Principles**

### **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Touch target minimum 44px

### **Performance**
- Sub-3 second load times
- Smooth 60fps animations
- Optimized images and assets
- Progressive loading
- Offline functionality where possible

### **Usability**
- One-handed mobile operation
- Clear visual hierarchy
- Consistent interaction patterns
- Forgiving error handling
- Quick task completion

## 🎨 **MOBILE NAVIGATION SYSTEM**

### **Bottom Tab Navigation** (Primary Navigation)
Fixed bottom navigation bar with 5 main tabs:

1. **🏠 Home** - Main Scheduler page (primary tab)
2. **🏆 Leaderboard** - Top users and rankings
3. **💰 Tips** - Micro-tips configuration  
4. **👤 Profile** - User dashboard and settings
5. **⚙️ More** - Additional features menu

### **"More" Tab Contents**
When user taps "More" tab, shows menu page with:
- **💎 Packages** - Subscription plans
- **⚡ Admin** - Admin dashboard (only visible to admin users)
- **🔗 Connect Wallet** / **🚪 Disconnect** - Auth button
- **📋 Help & Support**
- **📄 Terms & Privacy**

### **Bottom Navigation Specifications**
- **Height**: 80px (safe area + padding)
- **Background**: Dark with blur effect
- **Active State**: Purple accent color + icon fill
- **Inactive State**: Gray icons with labels
- **Badge Support**: Red notification dots for updates
- **Safe Area**: Respects iPhone home indicator

## 🎯 **FARCASTER MINI APP REQUIREMENTS**

### **Critical Farcaster Integration Points**
1. **Frame Compatibility**: Must work as Farcaster frame
2. **Mobile Optimization**: 100% mobile-first design
3. **Fast Loading**: < 3 second initial load
4. **Touch Optimized**: All buttons 44px+ touch targets
5. **Wallet Integration**: Seamless with Farcaster wallet
6. **Post Integration**: Direct posting to Farcaster
7. **Profile Integration**: Use Farcaster profile data

### **Technical Constraints**
- **Viewport**: Optimized for mobile screens (375px-414px width)
- **Performance**: Lightweight, minimal JavaScript
- **Accessibility**: WCAG 2.1 AA compliant
- **Browser Support**: iOS Safari, Android Chrome
- **Network**: Works on slow 3G connections

## 🎨 **ICON LIBRARY REQUIREMENTS**

### **Essential Icons Needed** (Beautiful, consistent style)
- 📅 Calendar, 🕐 Clock, ➕ Add, 🗑️ Delete, ✏️ Edit
- ⚡ Lightning, 📦 Package, 📷 Camera, 🏆 Trophy
- 💰 Money, 📝 Posts, 💖 Heart, 👥 Users, ⭐ Star
- 👍 Like, 🔄 Repost, 💬 Comment, ⚙️ Settings, 📊 Stats
- 👤 Profile, 🎁 Gift, 📈 Chart, 🔔 Bell, 🔒 Lock
- 🌍 Globe, 📤 Export, 🚪 Exit, 💎 Diamond, 🆓 Free
- 🚀 Rocket, 👑 Crown, ✅ Checkmark, 💳 Payment
- 🥇🥈🥉 Medals, 🚨 Alert, 🟢 Status, ☰ Menu

### **Icon Style Guidelines**
- **Style**: Modern, minimal, consistent line weight
- **Size**: 24px standard, 32px for primary actions
- **Color**: Adaptable to theme (white/purple)
- **Format**: SVG preferred for scalability

## 🚀 **DESIGN DELIVERABLES NEEDED**

### **What AI UX Builder Should Provide**:

1. **📱 Mobile Mockups** for all 6 pages
2. **🎨 Component Library** (buttons, cards, inputs, etc.)
3. **🎯 Interactive Prototypes** showing user flows
4. **📐 Responsive Layouts** (375px, 414px, 768px breakpoints)
5. **🎪 Animations Specifications** (micro-interactions)
6. **🎨 Icon Set** (all icons listed above)
7. **📋 Style Guide** (colors, typography, spacing)
8. **🔄 State Variations** (loading, error, empty, success)

### **File Formats Needed**:
- **Figma Files** (editable design files)
- **PNG Exports** (high-res mockups)
- **SVG Icons** (scalable icon set)
- **CSS Specifications** (exact styling code)
- **Component Documentation** (usage guidelines)

## 🎯 **SUCCESS CRITERIA**

### **Design Must Achieve**:
- ✅ **Beautiful UI** that rivals top mobile apps
- ✅ **Farcaster Native Feel** - fits seamlessly in ecosystem
- ✅ **Intuitive Navigation** - users understand immediately
- ✅ **Fast Performance** - optimized for mobile devices
- ✅ **Accessibility** - usable by all users
- ✅ **Scalable Design** - easy to add new features

### **Integration Requirements**:
- ✅ **Code Compatible** - works with existing Next.js codebase
- ✅ **Component Based** - reusable UI components
- ✅ **Theme Consistent** - matches existing dark theme
- ✅ **Responsive** - works on all mobile devices
- ✅ **Performance Optimized** - minimal impact on load times

---

## 📝 **FINAL INSTRUCTIONS FOR AI UX BUILDER**

**PRIORITY**: Focus on mobile-first design for Farcaster mini app integration

**MUST HAVES**:
1. **Bottom Tab Navigation** - 5 main tabs (Home, Leaderboard, Tips, Profile, More)
2. All 7 pages designed with beautiful UI (including More page)
3. Complete icon set with consistent style
4. Mobile-optimized layouts (thumb-friendly, one-handed operation)
5. Dark theme with purple accents matching existing codebase
6. Farcaster-native user experience
7. Ready-to-implement component specifications

**NAVIGATION PRIORITY**: 
- **Primary**: Bottom tab navigation (always visible)
- **Secondary**: More tab contains additional features (Packages, Admin, Settings)
- **No hamburger menus or dropdowns** - everything accessible via bottom tabs

**DELIVERABLE**: Complete mobile app design system with bottom tab navigation that can be directly integrated with existing Next.js/React codebase for Farcaster mini app deployment.

**CONTEXT**: This will be used inside Farcaster app, so it must feel native to crypto/web3 users while being intuitive for newcomers. The bottom tab navigation should feel like native mobile apps (Instagram, Twitter, etc.). The design should be modern, professional, and trustworthy for handling financial transactions (tips and payments).
