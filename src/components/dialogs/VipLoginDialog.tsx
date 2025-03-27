
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Crown, KeyRound, AtSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PasswordResetDialog from './PasswordResetDialog';
import { useNavigate } from 'react-router-dom';

// Form schema
const loginSchema = z.object({
  identifier: z.string().min(3, "Nickname or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const VipLoginDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const { toast } = useToast();
  const { updateUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  // Mock login function - in a real app, this would connect to an API
  const handleLogin = (values: LoginFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Test account credentials
      if (values.identifier === 'test@vip.com' && values.password === 'vippass') {
        // Success
        updateUserProfile({
          email: 'test@vip.com',
          isVip: true,
          subscriptionTier: 'monthly',
          subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          imagesRemaining: Infinity,
          voiceMessagesRemaining: 120, // Adding voice message limit for VIP users
          nickname: 'VIP Tester', // Adding nickname
        });
        
        toast({
          title: "VIP Access Granted",
          description: "Welcome to VIP access. Enjoy all the premium features!",
        });
        
        closeDialog();
        
        // Navigate to the profile setup page instead of chat
        navigate('/vip-profile');
      } else {
        // Failed login
        form.setError('password', { 
          type: 'manual', 
          message: 'Invalid nickname/email or password' 
        });
      }
    }, 1000);
  };

  const handleResetPassword = () => {
    setShowPasswordReset(true);
  };

  const handleSignupClick = () => {
    closeDialog();
    openDialog('vipSignup');
  };

  return (
    <>
      <Dialog open={state.isOpen && state.type === 'vipLogin'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-center text-xl">VIP Login</DialogTitle>
            <DialogDescription className="text-center">
              Login to your VIP account to enjoy premium features
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname or Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Enter your nickname or email" 
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
              
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="px-0"
                onClick={handleResetPassword}
              >
                Forgot password?
              </Button>
              
              <DialogFooter className="flex flex-col space-y-3 sm:space-y-0">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                
                <div className="flex items-center justify-center w-full mt-4">
                  <span className="text-sm text-muted-foreground">
                    Don't have a VIP account?
                  </span>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm"
                    onClick={handleSignupClick}
                  >
                    Sign up now
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Password Reset Dialog */}
      <PasswordResetDialog 
        isOpen={showPasswordReset} 
        onClose={() => setShowPasswordReset(false)}
        initialEmail={form.getValues('identifier')}
      />
    </>
  );
};

export default VipLoginDialog;
