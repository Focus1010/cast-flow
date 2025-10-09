# Cast Flow Admin Page - Design Prompt

## 🎯 **Admin Page Overview**
Design a comprehensive admin dashboard for Cast Flow that provides complete system management and analytics. This page is **ONLY visible to admin users** (you) and should feel powerful yet organized.

## 📱 **Page Layout & Navigation**
- **Access**: Via "More" tab → "⚡ Admin" option (only visible to admin users)
- **Layout**: Mobile-first dashboard with scrollable sections
- **Header**: "⚡ Admin Dashboard" with admin badge
- **Navigation**: Back button to return to More page

## 🎛️ **ADMIN COMPONENTS & FUNCTIONS**

### **1. QUICK STATS OVERVIEW** (Top Section)
**Visual**: 4 stat cards in 2x2 grid on mobile

#### **Card 1: Total Users** 👥
- **Icon**: 👥 Users icon
- **Primary Number**: "1,247" (total registered users)
- **Subtitle**: "Active Users"
- **Trend**: "+12% this month" (green arrow up)
- **Function**: Click to view detailed user analytics

#### **Card 2: Monthly Revenue** 💰
- **Icon**: 💰 Money icon  
- **Primary Number**: "$3,420" (total USDC revenue)
- **Subtitle**: "This Month"
- **Trend**: "+28% vs last month" (green arrow up)
- **Function**: Click to view revenue breakdown

#### **Card 3: Scheduled Posts** 📝
- **Icon**: 📝 Posts icon
- **Primary Number**: "8,934" (total scheduled posts)
- **Subtitle**: "All Time"
- **Trend**: "456 this week" (neutral)
- **Function**: Click to view posting analytics

#### **Card 4: System Health** 🟢
- **Icon**: 🟢 Status indicator (green/yellow/red)
- **Primary Text**: "All Systems Operational"
- **Subtitle**: "Last updated: 2 min ago"
- **Function**: Click to view system status details

---

### **2. USER MANAGEMENT SECTION** 👥
**Visual**: Expandable section with search and user list

#### **Search & Filters**
- **Search Bar**: "Search users by FID, username, or wallet..."
- **Filter Buttons**: 
  - "All Users" | "Free Plan" | "Paid Plans" | "Admins"
- **Sort Options**: "Newest" | "Most Active" | "Highest Spender"

#### **User List Cards**
Each user shows:
- **Profile Picture**: Circular avatar
- **User Info**: 
  - Username + Farcaster verification badge
  - FID number
  - Wallet address (truncated)
- **Plan Badge**: "Free" | "Starter" | "Pro" | "Elite"
- **Stats**: Posts scheduled, Tips given/received
- **Admin Actions**:
  - 🔧 "Manage" button (upgrade/downgrade plan)
  - ⏸️ "Suspend" button (suspend user)
  - 📊 "Analytics" button (detailed user stats)

#### **Functions**:
- **Search users** by any identifier
- **Filter by subscription** tier
- **Upgrade/downgrade** user plans manually
- **Suspend problematic** users
- **View detailed analytics** per user

---

### **3. SYSTEM CONTROLS SECTION** ⚙️
**Visual**: Grid of control cards with actions

#### **Scheduled Posts Monitor**
- **Icon**: 📅 Calendar
- **Title**: "Scheduled Posts Queue"
- **Info**: "23 posts pending in next 24h"
- **Actions**: 
  - "View Queue" - See all upcoming posts
  - "Force Process" - Manually trigger posting
- **Function**: Monitor and control the automated posting system

#### **Tips Pool Monitor**
- **Icon**: 💰 Tips
- **Title**: "Active Tip Pools"
- **Info**: "$1,234 in active pools"
- **Actions**:
  - "View Pools" - See all active tip configurations
  - "Emergency Stop" - Pause all tip distributions
- **Function**: Monitor tip pools and distributions

#### **Revenue Tracking**
- **Icon**: 📈 Chart
- **Title**: "Payment Processing"
- **Info**: "12 payments processed today"
- **Actions**:
  - "View Transactions" - Detailed payment history
  - "Export Data" - Download financial reports
- **Function**: Track all USDC payments and subscriptions

#### **System Settings**
- **Icon**: ⚙️ Settings
- **Title**: "App Configuration"
- **Info**: "Last updated: 2 days ago"
- **Actions**:
  - "Update Limits" - Modify posting limits per plan
  - "Token Settings" - Configure supported tokens
  - "Feature Flags" - Enable/disable features
- **Function**: Configure app-wide settings and limits

---

### **4. ANALYTICS DASHBOARD** 📊
**Visual**: Charts and graphs section

#### **Revenue Chart**
- **Type**: Line chart showing monthly revenue
- **Time Range**: Last 6 months
- **Breakdown**: By subscription tier
- **Function**: Track revenue trends and growth

#### **User Growth Chart**
- **Type**: Area chart showing user registrations
- **Metrics**: New users, active users, churned users
- **Function**: Monitor user acquisition and retention

#### **Usage Analytics**
- **Posts per Day**: Bar chart of posting activity
- **Tips Distribution**: Pie chart of tip token types
- **Popular Features**: Usage heatmap
- **Function**: Understand how users engage with features

---

### **5. ADMIN ACTIONS SECTION** ⚡
**Visual**: Important admin-only actions with confirmation

#### **Emergency Controls**
- **🚨 Emergency Stop**: Pause all automated systems
- **🔄 Force Restart**: Restart posting queue processing
- **📢 Send Announcement**: Broadcast message to all users
- **🛡️ Enable Maintenance**: Put app in maintenance mode

#### **Data Management**
- **📤 Export All Data**: Download complete database backup
- **🗑️ Cleanup Old Posts**: Remove posts older than 6 months
- **📊 Generate Reports**: Create monthly analytics reports
- **🔧 Database Maintenance**: Run optimization tasks

#### **User Communication**
- **📧 Email Blast**: Send email to all users
- **🔔 Push Notifications**: Send app notifications
- **📋 Support Tickets**: View and respond to user issues

---

### **6. REAL-TIME MONITORING** 📡
**Visual**: Live activity feed and alerts

#### **Activity Feed**
- **Real-time updates** of user actions:
  - "User @alice scheduled 3 posts"
  - "Payment received: $10 USDC from @bob"
  - "Tip pool created: 100 USDC by @charlie"
- **Auto-refresh** every 30 seconds
- **Filter options** by activity type

#### **System Alerts**
- **Error notifications**: Failed posts, payment issues
- **Performance alerts**: High load, slow responses
- **Security alerts**: Suspicious activity, failed logins
- **Success notifications**: Successful deployments, milestones

---

## 🎨 **DESIGN SPECIFICATIONS**

### **Color Coding**
- **Green**: Positive metrics, success states
- **Red**: Errors, emergency actions, alerts
- **Purple**: Primary actions, admin-specific features
- **Gray**: Neutral information, secondary actions
- **Yellow**: Warnings, pending actions

### **Admin-Specific Styling**
- **Admin Badge**: Lightning bolt ⚡ icon next to page title
- **Elevated Cards**: Slightly more shadow/depth than regular pages
- **Power User Feel**: More dense information, advanced controls
- **Professional Look**: Clean, organized, dashboard-style layout

### **Mobile Optimization**
- **Collapsible Sections**: Expand/collapse for better mobile navigation
- **Swipeable Cards**: Horizontal scroll for stat cards
- **Touch-Friendly**: All buttons 44px+ for easy tapping
- **Quick Actions**: Most important functions easily accessible

### **Security Indicators**
- **Admin-Only Badge**: Clear indication this is admin area
- **Sensitive Actions**: Confirmation dialogs for destructive actions
- **Activity Logging**: All admin actions are logged and visible
- **Permission Levels**: Different access levels for different admin functions

## 🔐 **ADMIN PERMISSIONS & FUNCTIONS**

### **What Admin Can Do**:
1. **View all user data** and analytics
2. **Modify user subscriptions** (upgrade/downgrade)
3. **Suspend or ban users** if needed
4. **Monitor all scheduled posts** and tip pools
5. **Access financial data** and revenue reports
6. **Configure app settings** and limits
7. **Send communications** to users
8. **Emergency system controls** (stop/start services)
9. **Export data** and generate reports
10. **Monitor system health** and performance

### **Admin Safety Features**:
- **Confirmation dialogs** for destructive actions
- **Activity audit log** of all admin actions
- **Emergency rollback** capabilities
- **Multi-step verification** for sensitive operations

This admin dashboard gives you complete control over Cast Flow while maintaining a clean, mobile-friendly interface that works seamlessly within the Farcaster mini app ecosystem.
