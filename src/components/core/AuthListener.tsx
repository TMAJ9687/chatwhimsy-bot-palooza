
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
  const redirectInProgressRef = useRef(false);
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
    
    // Reset redirect status when path changes
    if (redirectInProgressRef.current) {
      redirectInProgressRef.current = false;
    }
    
    // Single, well-managed auth listener
    if (!authListenerSetRef.current) {
      authListenerSetRef.current = true;
      
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        
        if (!user) {
          const currentPath = location.pathname;
          
          // Avoid redirecting if we're on public paths or during admin redirect
          if (adminRedirectInProgress.current || redirectInProgressRef.current) {
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
    // Prevent redirect loops
    if (redirectInProgressRef.current) {
      return;
    }
    
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
            redirectInProgressRef.current = true;
            // Use setTimeout to avoid immediate navigation that could cause DOM issues
            setTimeout(() => {
              navigate('/vip-profile');
            }, 50);
            return;
          }
        } else {
          redirectInProgressRef.current = true;
          // Use setTimeout to avoid immediate navigation that could cause DOM issues
          setTimeout(() => {
            navigate('/');
          }, 50);
          return;
        }
      } catch (e) {
        redirectInProgressRef.current = true;
        // Use setTimeout to avoid immediate navigation that could cause DOM issues
        setTimeout(() => {
          navigate('/');
        }, 50);
        return;
      }
    }
    
    // Default redirect for other protected routes
    redirectInProgressRef.current = true;
    // Use setTimeout to avoid immediate navigation that could cause DOM issues
    setTimeout(() => {
      navigate('/');
    }, 50);
  };
  
  return null;
};

export default AuthListener;
