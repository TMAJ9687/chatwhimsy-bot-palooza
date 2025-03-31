
// Import necessary modules
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import useAdmin from '@/hooks/useAdmin';
import { useUser } from '@/context/UserContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setUser } = useUser();

  const performLogout = async () => {
    try {
      // Clear user data
      setUser(null);
      
      // Call auth logout
      await logout();
      
      // Clear any local storage items
      localStorage.removeItem('lastRoute');
      localStorage.removeItem('chatState');
      localStorage.removeItem('vipProfileComplete');
      
      // Redirect to home page
      navigate('/');
      
      // Show success message (this will be handled by the Dialog component)
      console.log('Successfully logged out');
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  return { performLogout };
};
