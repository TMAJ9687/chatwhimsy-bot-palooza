
import { useEffect } from 'react';
import { performDOMCleanup } from '@/utils/errorHandler';

export const useLogoutSync = () => {
  // Add a global storage event listener for logout coordination
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'logoutEvent') {
        console.log('Logout event received from another tab/window');
        
        // Clean up DOM first to prevent navigation issues
        performDOMCleanup();
        
        // Clear all user-related local storage
        localStorage.removeItem('vipProfileComplete');
        localStorage.removeItem('chatUser');
        localStorage.removeItem('adminEmail');
        sessionStorage.clear();
        
        // Use location.replace instead of reload for cleaner experience
        window.location.replace('/?sync=true');
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
};

export default useLogoutSync;
