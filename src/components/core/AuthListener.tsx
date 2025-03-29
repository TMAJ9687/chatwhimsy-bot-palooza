
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChange } from '@/firebase/auth';

const AuthListener = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authListenerSetRef = useRef(false);
  const adminRedirectInProgress = useRef(false);
  
  useEffect(() => {
    console.log('AuthListener initialized, current path:', location.pathname);
    
    // Don't interfere with admin login/dashboard paths
    if (location.pathname === '/secretadminportal' || 
        location.pathname.includes('/admin')) {
      console.log('On admin page, skipping auth redirects');
      return;
    }
    
    if (!authListenerSetRef.current) {
      authListenerSetRef.current = true;
      
      const unsubscribe = onAuthStateChange((user) => {
        console.log('Firebase auth state changed:', user ? 'logged in' : 'logged out');
        
        if (!user) {
          const currentPath = location.pathname;
          
          // Avoid redirecting if we're on public paths or during admin redirect
          if (adminRedirectInProgress.current) {
            console.log('Admin redirect in progress, skipping auth redirect');
            return;
          }
          
          if (
            currentPath !== '/' && 
            currentPath !== '/vip-login' && 
            currentPath !== '/vip-signup' &&
            !currentPath.includes('/admin') &&
            currentPath !== '/secretadminportal' &&
            currentPath !== '/feedback'
          ) {
            console.log('Detected Firebase logout, redirecting to home');
            
            try {
              const savedUserData = localStorage.getItem('chatUser');
              if (savedUserData) {
                const userData = JSON.parse(savedUserData);
                if (userData.isVip) {
                  navigate('/');
                } else {
                  navigate('/feedback');
                }
                return;
              }
            } catch (e) {
              console.error('Error parsing saved user data:', e);
            }
            
            navigate('/');
          }
        }
      });
      
      return () => {
        unsubscribe();
        authListenerSetRef.current = false;
      };
    }
  }, [location.pathname, navigate]);
  
  return null;
};

export default AuthListener;
