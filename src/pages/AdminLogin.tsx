
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, ShieldAlert } from "lucide-react";
import PasswordResetDialog from '@/components/dialogs/PasswordResetDialog';
import { useUser } from '@/context/UserContext';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { trackAsyncOperation } from '@/utils/performanceMonitor';
import { signInWithEmail, isUserAdmin, getCurrentUser } from '@/firebase/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Admin Login Page accessible through secret path
 * Handles authentication for admin users
 */
const AdminLogin = () => {
  console.log('AdminLogin component rendering');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUser, user } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  
  // Check if already logged in as admin
  useEffect(() => {
    console.log('Checking admin login state in AdminLogin component...');
    console.log('Current path:', location.pathname);
    
    const checkAdminLogin = async () => {
      // Check both user context and Firebase auth
      const isLoggedIn = (user?.isAdmin === true) || isAdminLoggedIn();
      const firebaseUser = getCurrentUser();
      console.log('Admin login check:', { 
        contextAdmin: user?.isAdmin, 
        serviceAdmin: isAdminLoggedIn(), 
        firebaseUser: !!firebaseUser,
        path: location.pathname
      });
      
      if (isLoggedIn || (firebaseUser && isUserAdmin(firebaseUser))) {
        console.log('Admin is already logged in, redirecting to dashboard');
        // If user object doesn't exist but we're logged in through Firebase
        if (!user?.isAdmin && firebaseUser && isUserAdmin(firebaseUser)) {
          console.log('Creating admin user from Firebase credentials');
          setUser({
            id: firebaseUser.uid || 'admin-user',
            nickname: 'Admin',
            email: firebaseUser.email || 'admin@example.com',
            gender: 'male',
            age: 30,
            country: 'US',
            interests: ['Administration'],
            isVip: true,
            isAdmin: true,
            subscriptionTier: 'none',
            imagesRemaining: Infinity,
            voiceMessagesRemaining: Infinity
          });
        }
        
        // Navigate to dashboard after short delay to ensure user state is updated
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 100);
      } else {
        console.log('No admin session detected, showing login form');
        // Clear any stale admin data
        localStorage.removeItem('adminEmail');
      }
      
      setAdminCheckComplete(true);
    };
    
    checkAdminLogin();
  }, [user, navigate, setUser, location.pathname]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    console.log('Attempting admin login...');
    
    try {
      // Use trackAsyncOperation for better performance insight
      const result = await trackAsyncOperation('admin-login', async () => {
        try {
          // Try to log in with Firebase Auth
          console.log('Trying Firebase login with:', email);
          const user = await signInWithEmail(email, password);
          console.log('Firebase login successful:', user);
          
          // Check if the user is an admin
          const admin = isUserAdmin(user);
          console.log('User admin status:', admin);
          
          if (!admin) {
            setLoginError('Account does not have admin privileges');
            return false;
          }
          
          return true;
        } catch (error: any) {
          console.error('Firebase login error:', error);
          
          if (error.code === 'auth/invalid-credential') {
            setLoginError('Invalid email or password');
          } else if (error.code === 'auth/user-not-found') {
            setLoginError('User not found');
          } else if (error.code === 'auth/wrong-password') {
            setLoginError('Incorrect password');
          } else if (error.code === 'auth/too-many-requests') {
            setLoginError('Too many failed login attempts. Please try again later.');
          } else {
            setLoginError(error.message || 'Authentication failed');
          }
          
          // For demo purposes, allow login with hardcoded credentials
          if (email === 'admin@example.com' && password === 'admin123') {
            console.log('Using fallback admin credentials');
            return true;
          }
          
          return false;
        }
      });
      
      if (result) {
        console.log('Admin login successful, setting up session');
        // Save admin email for session persistence
        localStorage.setItem('adminEmail', email);
        
        // Set adminData to indicate login status
        localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
        
        // Create admin user profile
        setUser({
          id: getCurrentUser()?.uid || 'admin-user',
          nickname: 'Admin',
          email: email,
          gender: 'male',
          age: 30,
          country: 'US',
          interests: ['Administration'],
          isVip: true,
          isAdmin: true,
          subscriptionTier: 'none',
          imagesRemaining: Infinity,
          voiceMessagesRemaining: Infinity
        });
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        
        // Explicitly navigate to admin dashboard after a short delay
        // to ensure state updates have been processed
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 100);
      } else {
        console.log('Admin login failed');
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An unexpected error occurred');
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only render the form if admin check is complete and we're still on this page
  if (!adminCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md shadow-lg p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <ShieldAlert className="h-10 w-10 text-amber-500 mb-4" />
            <p>Checking authentication...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <ShieldAlert className="h-10 w-10 text-amber-500 mr-2" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Secure Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="px-0 font-normal text-xs" 
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {loginError && (
              <Alert variant="destructive" className="text-sm p-3">
                <AlertDescription>
                  {loginError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-sm text-muted-foreground p-2 border border-amber-300 rounded bg-amber-50 dark:bg-amber-900/20">
              <p>You can use demo credentials:</p>
              <p><strong>Email:</strong> admin@example.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <PasswordResetDialog 
        isOpen={isResetDialogOpen} 
        onClose={() => setIsResetDialogOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};

export default AdminLogin;
