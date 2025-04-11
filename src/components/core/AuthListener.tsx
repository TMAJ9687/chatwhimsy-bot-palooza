
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChange } from '@/services/auth/supabaseAuth';
import { User } from '@supabase/supabase-js';

const AuthListener = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authListenerSetRef = useRef(false);
  const adminRedirectInProgress = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const lastPathRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Don't interfere with admin login/dashboard or VIP profile paths
    if (location.pathname === '/secretadminportal' || 
        location.pathname.includes('/admin') ||
        location.pathname === '/vip-profile') {
      return;
    }
    
    // Store the current path to detect actual changes
    lastPathRef.current = location.pathname;
    
    // Single, well-managed auth listener
    if (!authListenerSetRef.current) {
      authListenerSetRef.current = true;
      
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        
        if (!user) {
          const currentPath = location.pathname;
          
          // Avoid redirecting if we're on public paths or during admin redirect
          if (adminRedirectInProgress.current) {
            return;
          }
          
          // Handle redirection based on paths and localStorage
          handleNonAuthenticatedRedirect(currentPath);
        }
      });
      
      // Ensure cleanup on unmount
      return () => {
        unsubscribe();
        authListenerSetRef.current = false;
      };
    }
  }, [location.pathname, navigate]);
  
  // Extracted redirect logic for better organization
  const handleNonAuthenticatedRedirect = (currentPath: string) => {
    // Public paths that don't require redirection
    const publicPaths = ['/', '/vip-login', '/vip-signup', '/secretadminportal', 
                         '/feedback', '/vip-profile', '/subscribe', '/subscribe/monthly', 
                         '/subscribe/semiannual', '/subscribe/annual', '/vip-payment', 
                         '/vip-confirmation'];
    
    // Early return for public paths
    if (publicPaths.includes(currentPath) || currentPath.includes('/admin')) {
      return;
    }
    
    // Special handling for /chat route
    if (currentPath === '/chat') {
      try {
        const savedUserData = localStorage.getItem('chatUser');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          
          // Allow standard users and VIP users with valid profile to stay on /chat
          if (!userData.isVip || (userData.isVip && localStorage.getItem('vipProfileComplete') === 'true')) {
            return; // Keep user on /chat if they have a valid profile
          }
          
          // VIP users without complete profile should be redirected to profile setup
          if (userData.isVip && localStorage.getItem('vipProfileComplete') !== 'true') {
            // Use navigate for React Router navigation instead of direct DOM manipulation
            navigate('/vip-profile');
            return;
          }
        } else {
          // Use navigate for React Router navigation instead of direct DOM manipulation
          navigate('/');
          return;
        }
      } catch (e) {
        // Use navigate for React Router navigation instead of direct DOM manipulation
        navigate('/');
        return;
      }
    }
    
    // Default redirect for other protected routes
    // Use navigate for React Router navigation instead of direct DOM manipulation
    navigate('/');
  };
  
  return null;
};

export default AuthListener;
