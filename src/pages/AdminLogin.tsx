
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from '@/hooks/useAdminSession';
import { adminLogin } from '@/services/admin/adminAuth';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';
import Button from '@/components/shared/Button';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, checkForDashboardRedirect } = useAdminSession();
  
  useEffect(() => {
    // Check if already authenticated and redirect if needed
    const dashboardPath = checkForDashboardRedirect();
    if (dashboardPath) {
      navigate(dashboardPath);
    }
  }, [isAuthenticated, checkForDashboardRedirect, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const isValid = await adminLogin(email, password);
      
      if (isValid) {
        console.log('Admin login successful');
        toast({
          title: 'Login successful.',
          description: 'Redirecting to admin dashboard...',
        });
        
        // Redirect to admin dashboard after successful login
        navigate('/admin-dashboard');
      } else {
        console.log('Admin login failed');
        toast({
          variant: 'destructive',
          title: 'Authentication failed.',
          description: 'Invalid credentials. Please check your email and password.',
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error.message);
      toast({
        variant: 'destructive',
        title: 'Login error.',
        description: 'Failed to log in. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              className="bg-secondary text-white font-semibold py-3 rounded-lg w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
