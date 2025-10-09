import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      try {
        router.replace('/scheduler');
      } catch (error) {
        console.error('Router error:', error);
        // Fallback: show a simple page instead of redirecting
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  if (!isMounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <h1>Cast Flow</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return null;
}
