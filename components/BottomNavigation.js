import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const BottomNavigation = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const isAdmin = user?.fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID);

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      path: '/',
      active: router.pathname === '/'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: '🏆',
      path: '/leaderboard',
      active: router.pathname === '/leaderboard'
    },
    {
      id: 'tips',
      label: 'Tips',
      icon: '💰',
      path: '/tips',
      active: router.pathname === '/tips'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      path: '/profile',
      active: router.pathname === '/profile'
    },
    {
      id: 'more',
      label: 'More',
      icon: '⚙️',
      path: '/more',
      active: router.pathname === '/more' || (router.pathname === '/admin' && isAdmin)
    }
  ];

  const handleTabClick = (path) => {
    router.push(path);
  };

  return (
    <div className="bottom-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${tab.active ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
