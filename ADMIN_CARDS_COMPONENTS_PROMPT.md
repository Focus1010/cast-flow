# Cast Flow Admin Page - Cards & Components Design Prompt

## 🎯 **ADMIN DASHBOARD COMPONENTS**

### **📊 QUICK STATS CARDS** (Top Priority)

#### **Card 1: Total Users Card** 👥
```
Design a stat card with:
- Background: Dark glass morphism effect
- Icon: 👥 Users icon (24px, purple accent)
- Main Number: "1,247" (large, bold, white text)
- Label: "Total Users" (smaller, gray text)
- Trend Indicator: "+12% this month" (green text with ↗️ arrow)
- Size: Mobile-optimized, fits 2x2 grid
- Hover: Subtle glow effect
- Tap Action: Navigates to user analytics
```

#### **Card 2: Monthly Revenue Card** 💰
```
Design a stat card with:
- Background: Dark glass morphism with subtle green accent
- Icon: 💰 Money icon (24px, green color)
- Main Number: "$3,420" (large, bold, white text)
- Label: "Monthly Revenue" (smaller, gray text)
- Trend Indicator: "+28% vs last month" (green text with ↗️ arrow)
- Currency: "USDC" badge in corner
- Size: Mobile-optimized, fits 2x2 grid
- Hover: Subtle green glow
- Tap Action: Opens revenue breakdown
```

#### **Card 3: Scheduled Posts Card** 📝
```
Design a stat card with:
- Background: Dark glass morphism with purple accent
- Icon: 📝 Posts icon (24px, purple color)
- Main Number: "8,934" (large, bold, white text)
- Label: "Scheduled Posts" (smaller, gray text)
- Trend Indicator: "456 this week" (neutral gray text)
- Size: Mobile-optimized, fits 2x2 grid
- Hover: Subtle purple glow
- Tap Action: Opens posts queue
```

#### **Card 4: System Health Card** 🟢
```
Design a status card with:
- Background: Dark glass morphism
- Status Icon: 🟢 Green circle (healthy) / 🟡 Yellow (warning) / 🔴 Red (error)
- Main Text: "All Systems Operational" (medium, white text)
- Label: "System Status" (smaller, gray text)
- Last Updated: "Updated 2 min ago" (tiny, muted text)
- Size: Mobile-optimized, fits 2x2 grid
- Hover: Subtle glow matching status color
- Tap Action: Opens system details
```

---

### **👥 USER MANAGEMENT COMPONENTS**

#### **User Search Bar**
```
Design a search component with:
- Background: Dark input field with glass effect
- Placeholder: "Search users by FID, username, or wallet..."
- Icon: 🔍 Search icon (left side)
- Clear Button: ✕ icon (right side, when typing)
- Border: Purple accent on focus
- Size: Full width on mobile
- Auto-complete: Dropdown suggestions
```

#### **Filter Buttons Row**
```
Design filter buttons with:
- Layout: Horizontal scrollable row
- Buttons: "All Users" | "Free Plan" | "Paid Plans" | "Admins"
- Style: Pill-shaped buttons
- Active State: Purple background, white text
- Inactive State: Dark background, gray text
- Badge: Number count on each filter (e.g., "Free Plan (234)")
- Size: Touch-friendly (44px height)
```

#### **User Card Component**
```
Design user cards with:
- Layout: Horizontal card with avatar, info, and actions
- Avatar: Circular profile picture (48px)
- User Info Section:
  - Username + Farcaster verification badge
  - FID number (smaller, gray)
  - Wallet address (truncated: 0x1234...5678)
- Plan Badge: Color-coded pill ("Free", "Starter", "Pro", "Elite")
- Stats Row: "12 posts | 5 tips given | 2 tips received"
- Action Buttons: 
  - 🔧 "Manage" (primary)
  - ⏸️ "Suspend" (warning)
  - 📊 "Analytics" (secondary)
- Background: Dark card with subtle border
- Hover: Slight elevation increase
```

---

### **⚙️ SYSTEM CONTROL CARDS**

#### **Scheduled Posts Monitor Card**
```
Design a control card with:
- Header: 📅 Calendar icon + "Scheduled Posts Queue"
- Status Info: "23 posts pending in next 24h"
- Progress Bar: Visual indicator of queue status
- Action Buttons:
  - "View Queue" (primary button)
  - "Force Process" (secondary button)
- Alert Badge: Red notification dot if issues
- Background: Dark glass card
- Size: Full width on mobile
```

#### **Tips Pool Monitor Card**
```
Design a control card with:
- Header: 💰 Tips icon + "Active Tip Pools"
- Status Info: "$1,234 USDC in active pools"
- Token Breakdown: Small icons for ETH, USDC, ENB, FCS with amounts
- Action Buttons:
  - "View Pools" (primary button)
  - "Emergency Stop" (danger button)
- Status Indicator: Green/yellow/red dot
- Background: Dark glass card
- Size: Full width on mobile
```

#### **Revenue Tracking Card**
```
Design a control card with:
- Header: 📈 Chart icon + "Payment Processing"
- Status Info: "12 payments processed today"
- Mini Chart: Small revenue trend line
- Action Buttons:
  - "View Transactions" (primary button)
  - "Export Data" (secondary button)
- Recent Activity: "Last payment: $10 USDC - 5 min ago"
- Background: Dark glass card
- Size: Full width on mobile
```

---

### **📊 ANALYTICS COMPONENTS**

#### **Revenue Chart Component**
```
Design a chart card with:
- Header: "Monthly Revenue Trend"
- Chart Type: Line chart with gradient fill
- Time Range: Tabs for "6M" | "3M" | "1M" | "1W"
- Data Points: Monthly revenue values
- Colors: Purple gradient matching app theme
- Hover: Show exact values on data points
- Background: Dark card with chart area
- Size: Full width, scrollable on mobile
```

#### **User Growth Chart Component**
```
Design a chart card with:
- Header: "User Growth"
- Chart Type: Area chart with multiple data series
- Metrics: "New Users" | "Active Users" | "Churned Users"
- Legend: Color-coded with toggle switches
- Colors: Green (new), blue (active), red (churned)
- Background: Dark card
- Size: Full width on mobile
```

---

### **⚡ EMERGENCY ACTION BUTTONS**

#### **Emergency Stop Button**
```
Design a critical action button with:
- Style: Large, red, prominent
- Icon: 🚨 Emergency icon
- Text: "Emergency Stop"
- Subtitle: "Pause all automated systems"
- Confirmation: Requires double-tap or confirmation dialog
- Visual: Pulsing red glow when active
- Size: Full width, high priority placement
```

#### **Maintenance Mode Toggle**
```
Design a toggle component with:
- Style: Large switch with status indicator
- Icon: 🛡️ Shield icon
- Text: "Maintenance Mode"
- Status: "ON" (red) / "OFF" (green)
- Description: "Prevents new user actions"
- Confirmation: Requires admin password
- Visual: Clear on/off states
```

---

### **📡 REAL-TIME ACTIVITY FEED**

#### **Activity Feed Component**
```
Design a live feed with:
- Header: "Live Activity" with auto-refresh indicator
- Feed Items: 
  - User avatar (small, 32px)
  - Action text: "User @alice scheduled 3 posts"
  - Timestamp: "2 minutes ago"
  - Action type icon (📝 for posts, 💰 for tips, etc.)
- Auto-scroll: New items appear at top
- Background: Dark list with subtle separators
- Size: Scrollable, fixed height on mobile
- Refresh: Pull-to-refresh on mobile
```

#### **System Alerts Component**
```
Design an alerts panel with:
- Alert Types:
  - 🔴 Error: "Failed to process 3 posts"
  - 🟡 Warning: "High server load detected"
  - 🟢 Success: "Monthly report generated"
- Alert Cards:
  - Severity color (red/yellow/green left border)
  - Alert message
  - Timestamp
  - "Dismiss" or "View Details" actions
- Priority: Critical alerts at top
- Background: Dark cards with colored accents
```

---

## 🎨 **DESIGN SPECIFICATIONS**

### **Card Styling**
- **Background**: `rgba(255, 255, 255, 0.08)` with backdrop blur
- **Border**: `1px solid rgba(255, 255, 255, 0.15)`
- **Border Radius**: `14px`
- **Padding**: `18px`
- **Shadow**: `0 8px 24px rgba(0, 0, 0, 0.4)`

### **Color Coding**
- **Success/Positive**: `#10b981` (green)
- **Warning**: `#f59e0b` (amber)
- **Error/Danger**: `#ef4444` (red)
- **Primary**: `#7c3aed` (purple)
- **Neutral**: `#64748b` (slate)

### **Typography**
- **Large Numbers**: `28px, weight 800`
- **Card Titles**: `16px, weight 600`
- **Labels**: `14px, weight 500`
- **Small Text**: `12px, weight 400`

### **Interactive States**
- **Hover**: `translateY(-2px)` + enhanced shadow
- **Active**: `translateY(0px)` + reduced shadow
- **Focus**: Purple border glow
- **Loading**: Skeleton animation or spinner

### **Mobile Optimization**
- **Touch Targets**: Minimum 44px height
- **Spacing**: 16px between cards
- **Grid**: 2 columns for stat cards
- **Scrolling**: Vertical scroll for long content
- **Safe Areas**: Respect mobile safe areas

This provides the AI UX Builder with exact specifications for every admin component, ensuring a cohesive and functional admin dashboard design.
