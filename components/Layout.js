import BottomNavigation from './BottomNavigation';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <main className="main page-content">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}