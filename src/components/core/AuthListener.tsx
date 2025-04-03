
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
  
  useEffect(() => {
    console.log('AuthListener initialized, current path:', location.pathname);
    
    // Don't interfere with admin login/dashboard paths
    if (location.pathname === '/secretadminportal' || 
        location.pathname.includes('/admin')) {
      console.log('On admin page, skipping auth redirects');
      return;
    }
    
    // Single, well-managed auth listener
    if (!authListenerSetRef.current) {
      console.log('Setting up Supabase auth state listener');
      authListenerSetRef.current = true;
      
      const unsubscribe = onAuthStateChange((user) => {
        console.log('Supabase auth state changed:', user ? `logged in as ${user.email}` : 'logged out');
        setUser(user);
        
        if (!user) {
          const currentPath = location.pathname;
          
          // Avoid redirecting if we're on public paths or during admin redirect
          if (adminRedirectInProgress.current) {
            console.log('Admin redirect in progress, skipping auth redirect');
            return;
          }
          
          // Handle redirection based on paths and localStorage
          handleNonAuthenticatedRedirect(currentPath);
        }
      });
      
      // Ensure cleanup on unmount
      return () => {
        console.log('Cleaning up Supabase auth listener');
        unsubscribe();
        authListenerSetRef.current = false;
      };
    }
  }, [location.pathname, navigate]);
  
  // Extracted redirect logic for better organization
  const handleNonAuthenticatedRedirect = (currentPath: string) => {
    // Public paths that don't require redirection
    const publicPaths = ['/', '/vip-login', '/vip-signup', '/secretadminportal', '/feedback', '/vip-profile'];
    
    // Early return for public paths
    if (publicPaths.includes(currentPath) || currentPath.includes('/admin')) {
      console.log(`User is on public path ${currentPath}, no redirect needed`);
      return;
    }
    
    // Special handling for /chat route
    if (currentPath === '/chat') {
      console.log('User on /chat route, checking localStorage profile');
      try {
        const savedUserData = localStorage.getItem('chatUser');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          console.log('Found user data in localStorage:', userData.nickname, 'isVip:', userData.isVip);
          
          // Allow standard users to stay on /chat
          if (!userData.isVip) {
            console.log('Allowing standard user access to /chat');
            return; // Do not redirect standard users with valid profile
          }
          
          // VIP users without auth should be redirected to login
          if (userData.isVip) {
            console.log('VIP user without auth, redirecting to home');
            navigate('/');
            return;
          }
        } else {
          console.log('No user data in localStorage, redirecting to landing');
          navigate('/');
          return;
        }
      } catch (e) {
        console.error('Error parsing saved user data:', e);
        navigate('/');
        return;
      }
    }
    
    // Default redirect for other protected routes
    console.log(`User on protected route ${currentPath} without auth, redirecting`);
    navigate('/');
  };
  
  return null;
};

export default AuthListener;
