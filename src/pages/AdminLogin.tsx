
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";
import PasswordResetDialog from '@/components/dialogs/PasswordResetDialog';
import { useUser } from '@/context/UserContext';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { trackAsyncOperation } from '@/utils/performanceMonitor';
import { signInWithEmail, isUserAdmin, getCurrentUser } from '@/firebase/auth';

/**
 * Admin Login Page
 * Handles authentication for admin users
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, user } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Check if already logged in as admin
  useEffect(() => {
    const checkAdminLogin = async () => {
      // Check both user context and Firebase auth
      const isLoggedIn = (user?.isAdmin === true) || isAdminLoggedIn();
      const firebaseUser = getCurrentUser();
      
      if (isLoggedIn || (firebaseUser && isUserAdmin(firebaseUser))) {
        // If user object doesn't exist but we're logged in through Firebase
        if (!user?.isAdmin && firebaseUser && isUserAdmin(firebaseUser)) {
          setUser({
            id: 'admin-user',
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
        
        // Navigate to dashboard
        navigate('/admin-dashboard');
      }
    };
    
    checkAdminLogin();
  }, [user, navigate, setUser]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Use trackAsyncOperation for better performance insight
      const result = await trackAsyncOperation('admin-login', async () => {
        try {
          // Try to log in with Firebase Auth
          const user = await signInWithEmail(email, password);
          console.log('Firebase login successful:', user);
          return true;
        } catch (error: any) {
          console.error('Firebase login error:', error);
          setLoginError(error.message || 'Authentication failed');
          
          // For demo purposes, allow login with hardcoded credentials
          if (email === 'admin@example.com' && password === 'admin123') {
            console.log('Using fallback admin credentials');
            return true;
          }
          
          return false;
        }
      });
      
      if (result) {
        // Save admin email for session persistence
        localStorage.setItem('adminEmail', email);
        
        // Create admin user profile
        setUser({
          id: 'admin-user',
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
        
        navigate('/admin-dashboard');
      } else {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
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
              <div className="text-sm text-red-500 p-2 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
                {loginError}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground p-2 border border-amber-300 rounded bg-amber-50 dark:bg-amber-900/20">
              <p>You can also use demo credentials:</p>
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
