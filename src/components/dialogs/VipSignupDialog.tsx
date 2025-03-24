
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
import { Crown, KeyRound, AtSign, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema
const signupSchema = z.object({
  nickname: z.string().min(3, "Nickname must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

const VipSignupDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const { toast } = useToast();
  const { updateUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
  });

  const handleSignup = (values: SignupFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Success case
      updateUserProfile({
        nickname: values.nickname,
        email: values.email,
        isVip: true,
        subscriptionTier: 'monthly',
        subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        imagesRemaining: Infinity,
        voiceMessagesRemaining: Infinity
      });
      
      toast({
        title: "VIP Account Created",
        description: "Your VIP account has been created successfully!",
      });
      
      closeDialog();
      
      // Use window.location for navigation instead of useNavigate
      window.location.href = '/vip-profile';
    }, 1500);
  };

  const handleLoginClick = () => {
    closeDialog();
    openDialog('vipLogin');
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipSignup'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl">Create VIP Account</DialogTitle>
          <DialogDescription className="text-center">
            Sign up for a VIP account to access premium features
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Choose a nickname" 
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
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
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
            
            <DialogFooter className="flex flex-col space-y-3 sm:space-y-0">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create VIP Account'}
              </Button>
              
              <div className="flex items-center justify-center w-full mt-4">
                <span className="text-sm text-muted-foreground">
                  Already have a VIP account?
                </span>
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm"
                  onClick={handleLoginClick}
                >
                  Log in
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VipSignupDialog;
