
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from '@/hooks/useAdminSession';
import { adminLogin } from '@/services/admin/supabaseAdminAuth';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';
import Button from '@/components/shared/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader } from 'lucide-react';
import AdminErrorHandler from '@/components/admin/ErrorHandler';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { isAuthenticated, checkForDashboardRedirect, error: sessionError, isLoading: sessionLoading, failedAttempts } = useAdminSession();
  
  // Define dashboardPath - it should be a redirect path from checkForDashboardRedirect or default to admin-dashboard
  const dashboardPath = checkForDashboardRedirect() || '/admin-dashboard';
  
  useEffect(() => {
    if (failedAttempts && failedAttempts > 2) {
      console.debug('Multiple authentication check failures detected');
      setErrorMessage(`Authentication system experiencing issues. Try refreshing the page or check browser console for details.`);
    }
  }, [failedAttempts]);
  
  useEffect(() => {
    if (isAuthenticated && dashboardPath) {
      console.log('Redirecting to dashboard - already authenticated');
      navigate(dashboardPath);
    }
  }, [isAuthenticated, navigate, dashboardPath]);

  useEffect(() => {
    if (sessionError) {
      console.error('Session error detected:', sessionError);
      setErrorMessage(`Authentication error: ${sessionError.message}`);
    }
  }, [sessionError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Attempting admin login with email:', email);
      
      setLoginAttempts(prev => prev + 1);
      
      if (loginAttempts >= 5) {
        setErrorMessage('Too many login attempts. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      const isValid = await adminLogin(email, password);
      
      if (isValid) {
        console.log('Admin login successful');
        toast({
          title: 'Login successful',
          description: 'Redirecting to admin dashboard...',
        });
        
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1000);
      } else {
        console.log('Admin login failed');
        setErrorMessage('Login failed. Please check your credentials and ensure you have admin access.');
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: 'Invalid credentials or admin access denied.',
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error.message);
      setErrorMessage(`Error: ${error.message}`);
      toast({
        variant: 'destructive',
        title: 'Login error',
        description: 'Failed to log in. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminErrorHandler>
      <div className="flex flex-col min-h-screen bg-background dark:bg-gray-900">
        <header className="py-6 px-8 flex justify-between items-center">
          <Logo variant="image" />
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-card text-card-foreground rounded-3xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
              <p className="text-muted-foreground">
                Enter your credentials to access the admin dashboard.
              </p>
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {sessionLoading && (
              <div className="flex items-center justify-center p-4 mb-4 bg-muted rounded-md">
                <Loader className="h-5 w-5 mr-2 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Checking authentication status...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || sessionLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || sessionLoading}
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="bg-secondary text-white font-semibold py-3 rounded-lg w-full"
                disabled={isLoading || sessionLoading}
                type="submit"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </span>
                ) : 'Login'}
              </Button>
            </form>
            
            {(failedAttempts > 2 || loginAttempts > 3) && (
              <div className="mt-4 p-3 text-xs bg-muted rounded-md">
                <p className="font-semibold">Troubleshooting Information:</p>
                <p>- Auth Check Attempts: {failedAttempts}</p>
                <p>- Login Attempts: {loginAttempts}</p>
                <p>- Session Loading: {sessionLoading ? 'Yes' : 'No'}</p>
                <p>- Browser: {navigator.userAgent}</p>
                <button 
                  className="text-blue-500 underline mt-1"
                  onClick={() => {
                    localStorage.removeItem('adminEmail');
                    localStorage.removeItem('adminData');
                    window.location.reload();
                  }}
                >
                  Clear Cached Admin Data
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
          <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
        </footer>
      </div>
    </AdminErrorHandler>
  );
};

export default AdminLogin;
