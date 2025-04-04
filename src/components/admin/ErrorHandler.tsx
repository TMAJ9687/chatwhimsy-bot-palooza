
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorCleaner } from '@/hooks/useErrorCleaner';

interface ErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Error boundary specifically for admin components
 */
const AdminErrorHandler: React.FC<ErrorHandlerProps> = ({ children }) => {
  const { toast } = useToast();
  const { handleError } = useErrorCleaner();
  
  // Handle API errors that are specific to the admin dashboard
  useEffect(() => {
    // Filter for admin-specific errors
    const handleAdminError = (event: ErrorEvent) => {
      const errorText = event.message || '';
      
      // Only handle admin-related errors and ignore CORS/external API errors
      if ((errorText.includes('admin_users') || 
          errorText.includes('admin_actions') ||
          errorText.includes('admin') ||
          errorText.includes('dashboard')) && 
          !errorText.includes('CORS') && 
          !errorText.includes('ipapi.co') && 
          !errorText.includes('429')) {
        
        // Prevent default handling
        event.preventDefault();
        
        // Log error for debugging
        console.error('Admin Error:', event.error || new Error(errorText));
        
        // Show user-friendly toast
        toast({
          title: "Admin Dashboard Error",
          description: "There was an issue loading the admin dashboard. Please try again or check your permissions.",
          variant: "destructive",
        });
      }
    };
    
    // Add error listener
    window.addEventListener('error', handleAdminError);
    
    return () => {
      window.removeEventListener('error', handleAdminError);
    };
  }, [toast, handleError]);
  
  // Handle unhandled promise rejections specific to admin
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || 'Unknown admin error';
      
      // Only handle admin-related errors and ignore CORS/external API errors
      if ((errorMessage.includes('admin_users') || 
          errorMessage.includes('admin_actions') ||
          errorMessage.includes('admin') ||
          errorMessage.includes('is_admin') ||
          errorMessage.includes('500') ||
          errorMessage.includes('dashboard')) && 
          !errorMessage.includes('CORS') && 
          !errorMessage.includes('ipapi.co') && 
          !errorMessage.includes('429')) {
        
        // Prevent default handling
        event.preventDefault();
        
        // Log error
        console.error('Admin Promise Error:', event.reason);
        
        // Show toast
        toast({
          title: "Admin Operation Failed",
          description: "There was an issue with the admin operation. This might be a temporary problem.",
          variant: "destructive",
        });
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [toast]);
  
  return <>{children}</>;
};

export default AdminErrorHandler;
