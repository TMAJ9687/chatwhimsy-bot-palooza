
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLoader from '@/components/admin/dashboard/DashboardLoader';
import AdminErrorHandler from '@/components/admin/ErrorHandler';

interface AdminAuthCheckerProps {
  isAdmin: boolean;
  loading: boolean;
  retryCount: number;
  handleRetry: () => void;
  redirectToLogin: () => void;
  children: React.ReactNode;
}

const AdminAuthChecker: React.FC<AdminAuthCheckerProps> = ({
  isAdmin,
  loading,
  retryCount,
  handleRetry,
  redirectToLogin,
  children
}) => {
  const navigate = useNavigate();

  // Check if user is authenticated as admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        if (!isAdmin && !loading) {
          console.log('Not authenticated as admin, redirecting to login page');
          navigate('/secretadminportal');
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        navigate('/secretadminportal');
      }
    };
    
    checkAdminAuth();
  }, [isAdmin, loading, navigate]);

  // Show loader if not authenticated or still loading
  if (!isAdmin && !loading) {
    return (
      <AdminErrorHandler>
        <DashboardLoader
          isAuthenticated={false}
          sessionLoading={false}
          loading={loading}
          retryCount={retryCount}
          handleRetry={handleRetry}
          redirectToLogin={redirectToLogin}
        />
      </AdminErrorHandler>
    );
  }
  
  if (loading) {
    return (
      <AdminErrorHandler>
        <DashboardLoader
          isAuthenticated={isAdmin}
          sessionLoading={false}
          loading={true}
          retryCount={retryCount}
          handleRetry={handleRetry}
          redirectToLogin={redirectToLogin}
        />
      </AdminErrorHandler>
    );
  }

  return <>{children}</>;
};

export default AdminAuthChecker;
