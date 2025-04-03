
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Crown, KeyRound, AtSign, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ThemeToggle from '@/components/shared/ThemeToggle';

// Form schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const VipLogin = () => {
  const { toast } = useToast();
  const { updateUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = (values: LoginFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Special test account
      if (values.email === 'test@vip.com' && values.password === 'vippass') {
        // Success case for test account
        updateUserProfile({
          nickname: 'VIP Tester',
          email: values.email,
          isVip: true,
          subscriptionTier: 'monthly',
          subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          imagesRemaining: Infinity
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome to your VIP account!",
        });
        
        // Use a slight delay for React to process state updates
        setTimeout(() => {
          // Navigate to VIP profile setup instead of chat
          navigate('/vip-profile');
        }, 50);
        return;
      }
      
      // General check for any valid email/password
      if (values.email.includes('@') && values.password.length >= 6) {
        // Success case
        updateUserProfile({
          nickname: values.email.split('@')[0],
          email: values.email,
          isVip: true,
          subscriptionTier: 'monthly',
          subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          imagesRemaining: Infinity
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome to your VIP account!",
        });
        
        // Use a slight delay for React to process state updates
        setTimeout(() => {
          // Navigate to VIP profile setup instead of chat
          navigate('/vip-profile');
        }, 50);
      } else {
        // Failed login
        form.setError('password', { 
          type: 'manual',
          message: 'Invalid email or password'
        });
      }
    }, 1000);
  };

  const handleBackToHome = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBackToHome} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Chat</span>
          </Button>
          <ThemeToggle />
        </div>
        
        <Card className="border-amber-100 dark:border-amber-900/40 shadow-lg">
          <CardHeader className="pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-center text-xl">VIP Login</CardTitle>
            <CardDescription className="text-center">
              Log in to access your VIP account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
                
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  <p>For testing, use: test@vip.com / vippass</p>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Don't have a VIP account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-500"
                onClick={() => navigate('/vip-signup')}
              >
                Sign up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VipLogin;
