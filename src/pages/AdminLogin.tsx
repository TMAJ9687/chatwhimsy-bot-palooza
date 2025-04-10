
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '@/services/admin/adminAuth';
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
  
  // Check if already logged in
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminEmail = localStorage.getItem('adminEmail');
        if (adminEmail) {
          console.log('Admin email found, redirecting to dashboard');
          navigate('/admin-dashboard');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
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
      
      // Simplified login logic
      const isValid = await adminLogin(email, password);
      
      if (isValid) {
        console.log('Admin login successful');
        toast({
          title: 'Login successful',
          description: 'Redirecting to admin dashboard...',
        });
        
        // Use a short delay for a better user experience
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 500);
      } else {
        console.log('Admin login failed');
        setErrorMessage('Login failed. Please check your credentials.');
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: 'Invalid credentials.',
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="bg-secondary text-white font-semibold py-3 rounded-lg w-full"
                disabled={isLoading}
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
            
            {loginAttempts > 3 && (
              <div className="mt-4 p-3 text-xs bg-muted rounded-md">
                <p className="font-semibold">Troubleshooting Information:</p>
                <p>- Login Attempts: {loginAttempts}</p>
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
