
import { useEffect } from 'react';

export const useLogoutSync = () => {
  // Add a global storage event listener for logout coordination
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'logoutEvent') {
        console.log('Logout event received from another tab/window');
        
        // Clear all user-related local storage
        localStorage.removeItem('vipProfileComplete');
        localStorage.removeItem('chatUser');
        sessionStorage.clear();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
};

export default useLogoutSync;
