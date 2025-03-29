
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChange } from '@/firebase/auth';
import { getVipUserProfile } from '@/firebase/firestore';
import { useUser } from '@/context/UserContext';

const AuthListener = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUserProfile } = useUser();
  const authListenerSetRef = useRef(false);
  const adminRedirectInProgress = useRef(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  useEffect(() => {
    console.log('AuthListener initialized, current path:', location.pathname);
    
    // Don't interfere with admin login/dashboard paths
    if (location.pathname === '/secretadminportal' || 
        location.pathname.includes('/admin')) {
      console.log('On admin page, skipping auth redirects');
      return;
    }
    
    // Allow direct access to VIP profile and VIP-related pages
    if (location.pathname === '/vip-profile' || 
        location.pathname === '/vip-login' ||
        location.pathname === '/vip-signup' ||
        location.pathname === '/vip-subscription' ||
        location.pathname === '/vip-payment' ||
        location.pathname === '/vip-confirmation') {
      console.log('On VIP page, skipping auth redirects:', location.pathname);
      return;
    }
    
    // Single, well-managed auth listener
    if (!authListenerSetRef.current) {
      console.log('Setting up Firebase auth state listener');
      authListenerSetRef.current = true;
      
      const unsubscribe = onAuthStateChange(async (user) => {
        console.log('Firebase auth state changed:', user ? `logged in as ${user.email}` : 'logged out');
        setFirebaseUser(user);
        
        if (user) {
          // For authenticated users, try to load their VIP profile from Firestore
          try {
            const vipProfile = await getVipUserProfile(user.uid);
            if (vipProfile) {
              console.log('Found VIP profile for authenticated user:', vipProfile.nickname);
              // Update the user context with the VIP profile
              updateUserProfile(vipProfile);
            }
          } catch (error) {
            console.error('Error loading VIP profile for authenticated user:', error);
          }
        } else {
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
        console.log('Cleaning up Firebase auth listener');
        unsubscribe();
        authListenerSetRef.current = false;
      };
    }
  }, [location.pathname, navigate, updateUserProfile]);
  
  // Extracted redirect logic for better organization
  const handleNonAuthenticatedRedirect = (currentPath: string) => {
    // Public paths that don't require redirection
    const publicPaths = ['/', '/vip-login', '/vip-signup', '/secretadminportal', '/feedback', 
                         '/vip-profile', '/vip-subscription', '/vip-payment', '/vip-confirmation'];
    
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
          
          // Check if VIP profile is complete
          const vipProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
          if (userData.isVip && !vipProfileComplete) {
            console.log('VIP user with incomplete profile, redirecting to VIP profile setup');
            navigate('/vip-profile');
            return;
          }
          
          // Allow VIP users with complete profiles to access chat
          if (userData.isVip && vipProfileComplete) {
            console.log('VIP user with complete profile, allowing access to chat');
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
