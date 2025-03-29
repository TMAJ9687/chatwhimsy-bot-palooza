
import { useEffect, useRef } from 'react';

export const useLogoutEffect = (
  hasLoggedOut: boolean, 
  setHasLoggedOut: (value: boolean) => void
) => {
  const logoutInProgressRef = useRef(false);
  
  useEffect(() => {
    if (hasLoggedOut && window.location.pathname === '/') {
      const timer = setTimeout(() => {
        setHasLoggedOut(false);
        logoutInProgressRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoggedOut, setHasLoggedOut]);
  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logoutEvent') {
        console.log('Detected logout from another tab');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return { logoutInProgressRef };
};

export default useLogoutEffect;
