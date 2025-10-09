import React from "react";
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function MorePage() {
  const { user, authenticated, login, logout } = useAuth();
  const router = useRouter();
  
  // Check if user is admin
  const isAdmin = user?.fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID);

  const menuItems = [
    {
      id: 'packages',
      icon: '💎',
      title: 'Packages',
      subtitle: 'Subscription plans',
      badge: 'FREE',
      action: () => router.push('/packages'),
      hasArrow: true
    },
    {
      id: 'admin',
      icon: '⚡',
      title: 'Admin Dashboard',
      subtitle: 'System management',
      action: () => router.push('/admin'),
      hasArrow: true,
      adminOnly: true
    },
    {
      id: 'wallet',
      icon: '🔗',
      title: 'Wallet Connected',
      subtitle: user?.wallet ? `${user.wallet.substring(0, 6)}...${user.wallet.substring(user.wallet.length - 4)}` : '0x1234...5678',
      toggle: true,
      isActive: authenticated
    },
    {
      id: 'help',
      icon: '❓',
      title: 'Help & Support',
      subtitle: '',
      action: () => window.open('https://docs.castflow.xyz', '_blank'),
      hasArrow: true,
      external: true
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      subtitle: 'Push notification settings',
      toggle: true,
      isActive: true
    }
  ];

  const handleItemClick = (item) => {
    if (item.adminOnly && !isAdmin) {
      return; // Don't show admin items to non-admins
    }
    
    if (item.action) {
      item.action();
    } else if (item.id === 'wallet') {
      if (authenticated) {
        logout();
      } else {
        login();
      }
    }
  };

  return (
    <div className="more-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ More</h1>
        </div>
        <div className="header-actions">
          <button className="notification-btn">🔔</button>
          <div className="user-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'JD'}
          </div>
        </div>
      </div>

      <div className="more-content">
        {/* User Profile Header */}
        <div className="user-profile-header">
          <div className="profile-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'JD'}
          </div>
          <div className="profile-info">
            <div className="profile-name">
              {user?.display_name || user?.username || 'johndoe.eth'}
            </div>
            <div className="profile-fid">FID: {user?.fid || '12345'}</div>
          </div>
          <div className="online-indicator"></div>
        </div>

        {/* Menu Items */}
        <div className="menu-section">
          {menuItems.map((item) => {
            // Hide admin items for non-admin users
            if (item.adminOnly && !isAdmin) {
              return null;
            }

            return (
              <div 
                key={item.id}
                className="menu-item"
                onClick={() => handleItemClick(item)}
              >
                <div className="menu-item-left">
                  <div className="menu-icon">{item.icon}</div>
                  <div className="menu-content">
                    <div className="menu-title">{item.title}</div>
                    {item.subtitle && (
                      <div className="menu-subtitle">{item.subtitle}</div>
                    )}
                  </div>
                </div>
                
                <div className="menu-item-right">
                  {item.badge && (
                    <div className="menu-badge">{item.badge}</div>
                  )}
                  {item.toggle && (
                    <div className={`toggle-switch ${item.isActive ? 'active' : ''}`}>
                      <div className="toggle-slider"></div>
                    </div>
                  )}
                  {item.hasArrow && (
                    <div className="menu-arrow">
                      {item.external ? '↗' : '›'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* App Version */}
        <div className="app-version">
          Cast Flow v1.0.2
        </div>
      </div>
    </div>
  );
}
