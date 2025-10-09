# Cast Flow - Design Export Requirements

## 📱 **Required Deliverables from AI UX Builder**

### **1. Figma Files (Primary)**
- **Main Design File**: Complete designs for all 7 pages
- **Component Library**: Reusable UI components
- **Icon Library**: All icons as individual components
- **Style Guide**: Colors, typography, spacing tokens

### **2. Code-Ready Exports**

#### **CSS/SCSS Files**
```
/exports/css/
├── variables.css          # CSS custom properties (colors, spacing, etc.)
├── components.css         # Component styles
├── layout.css            # Layout and navigation styles
├── pages.css             # Page-specific styles
└── animations.css        # Micro-interactions and transitions
```

#### **React Component Templates**
```
/exports/components/
├── BottomNavigation.jsx   # Bottom tab navigation
├── PageHeader.jsx         # Page headers
├── PostCard.jsx          # Scheduled post cards
├── UserCard.jsx          # User profile cards
├── TipCard.jsx           # Tip configuration cards
├── PackageCard.jsx       # Subscription package cards
├── Button.jsx            # Button variants
├── Input.jsx             # Form inputs
└── Modal.jsx             # Modal dialogs
```

#### **Icon Set (SVG)**
```
/exports/icons/
├── home.svg
├── leaderboard.svg
├── tips.svg
├── profile.svg
├── more.svg
├── calendar.svg
├── clock.svg
├── add.svg
├── delete.svg
├── edit.svg
└── [all other icons from brief]
```

### **3. Design Specifications**

#### **Design Tokens (JSON)**
```json
{
  "colors": {
    "primary": "#7c3aed",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#e6eef8"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px"
  },
  "typography": {
    "fontFamily": "Inter",
    "sizes": {
      "h1": "28px",
      "h2": "24px",
      "body": "14px"
    }
  }
}
```

#### **Component Documentation**
- Usage guidelines for each component
- Props and variants
- Responsive behavior
- Accessibility notes

### **4. High-Fidelity Mockups**
- **PNG/JPG exports** at 2x resolution
- **All 7 pages** in mobile viewport (375px width)
- **Key interaction states** (hover, active, loading)
- **Empty states** and error states

### **5. Interactive Prototype**
- **Figma Prototype** or **InVision** link
- **Clickable navigation** between pages
- **Key user flows** demonstrated

## 🔧 **Integration Strategy**

### **Phase 1: Setup Design System**
1. **Import CSS variables** into your existing `globals.css`
2. **Add icon components** to `/components/icons/` folder
3. **Create base components** using provided templates
4. **Update existing components** to match new designs

### **Phase 2: Implement Bottom Navigation**
1. **Create BottomNavigation component**
2. **Update Layout.js** to use bottom tabs instead of hamburger
3. **Add navigation state management**
4. **Test on mobile devices**

### **Phase 3: Update Pages**
1. **Scheduler page** - Update with new post composer design
2. **Leaderboard page** - Implement ranking cards
3. **Tips page** - Update configuration UI
4. **Profile page** - Add stats cards and wallet info
5. **More page** - Create menu options
6. **Admin page** - Admin dashboard (admin-only)
7. **Packages page** - Update subscription cards

### **Phase 4: Polish & Optimize**
1. **Add animations** and micro-interactions
2. **Test responsive behavior**
3. **Optimize for Farcaster mini app**
4. **Performance testing**

## 📋 **File Organization in Your Project**

### **Recommended Folder Structure**
```
cast-flow/
├── components/
│   ├── ui/                    # New design system components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── icons/                 # SVG icon components
│   │   ├── HomeIcon.jsx
│   │   ├── LeaderboardIcon.jsx
│   │   └── [other icons]
│   ├── navigation/
│   │   └── BottomNavigation.jsx
│   └── Layout.js             # Updated with bottom nav
├── styles/
│   ├── globals.css           # Updated with design tokens
│   ├── components.css        # Component-specific styles
│   └── pages.css            # Page-specific styles
├── pages/                    # Your existing pages (updated)
└── public/
    └── icons/               # Static SVG files
```

## 🎨 **Design Handoff Checklist**

### **Must-Have Deliverables:**
- [ ] Figma file with all 7 pages
- [ ] CSS variables file
- [ ] SVG icon set (50+ icons)
- [ ] React component templates
- [ ] Design tokens JSON
- [ ] Component documentation
- [ ] Mobile mockups (PNG)
- [ ] Interactive prototype link

### **Nice-to-Have:**
- [ ] Animation specifications
- [ ] Accessibility guidelines
- [ ] Performance recommendations
- [ ] Testing checklist

## 🚀 **Implementation Timeline**

### **Week 1: Design System Setup**
- Import design tokens
- Create base components
- Set up icon library

### **Week 2: Navigation & Layout**
- Implement bottom navigation
- Update Layout component
- Test mobile navigation

### **Week 3: Page Updates**
- Update all 7 pages with new designs
- Implement new components
- Add animations

### **Week 4: Polish & Testing**
- Mobile testing
- Farcaster mini app testing
- Performance optimization
- Bug fixes

## 📞 **Communication with AI UX Builder**

### **What to Request:**
1. **"Please provide all deliverables listed in DESIGN_EXPORT_REQUIREMENTS.md"**
2. **"Export components as React JSX templates"**
3. **"Include CSS custom properties for easy integration"**
4. **"Provide SVG icons optimized for React components"**
5. **"Include mobile-first responsive specifications"**

### **Key Questions to Ask:**
- "Can you provide the exact CSS for the bottom navigation?"
- "What are the specific color values and spacing units?"
- "How should the components respond to different screen sizes?"
- "What animations should be included for micro-interactions?"

This approach will give you everything needed to seamlessly integrate the new designs with your existing Cast Flow codebase while maintaining the functionality you've already built.
