
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Crown, KeyRound, AtSign, User, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ThemeToggle from '@/components/shared/ThemeToggle';

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

const getPlanDetails = (plan: string) => {
  switch(plan) {
    case 'monthly':
      return { 
        name: 'Monthly VIP Subscription', 
        price: '$4.99', 
        billing: 'Billed every month',
        tier: 'monthly' as const
      };
    case 'semiannual':
      return { 
        name: 'Semi-Annual VIP Subscription', 
        price: '$24.99', 
        billing: 'Billed every six months',
        tier: 'semiannual' as const
      };
    case 'annual':
      return { 
        name: 'Annual VIP Subscription', 
        price: '$35.99', 
        billing: 'Billed once a year',
        tier: 'annual' as const
      };
    default:
      return { 
        name: 'Monthly VIP Subscription', 
        price: '$4.99', 
        billing: 'Billed every month',
        tier: 'monthly' as const
      };
  }
};

const VipSignup = () => {
  const { toast } = useToast();
  const { updateUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get('plan') || 'monthly';
  const planDetails = getPlanDetails(selectedPlan);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
  });

  // If no plan is selected, redirect to plan selection
  useEffect(() => {
    if (!selectedPlan) {
      navigate('/vip-subscription');
    }
  }, [selectedPlan, navigate]);

  const handleSignup = (values: SignupFormValues) => {
    setIsLoading(true);
    
    // Show payment method dialog
    setTimeout(() => {
      setIsLoading(false);
      
      // Navigate to payment page with form values and plan
      navigate(`/vip-payment?plan=${selectedPlan}&email=${encodeURIComponent(values.email)}&nickname=${encodeURIComponent(values.nickname)}`);
    }, 800);
  };

  const handleBackToPlans = () => {
    navigate('/vip-subscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBackToPlans} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Plans</span>
          </Button>
          <ThemeToggle />
        </div>
        
        <Card className="border-amber-100 dark:border-amber-900/40 shadow-lg">
          <CardHeader className="pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-center text-xl">Create VIP Account</CardTitle>
            <CardDescription className="text-center">
              Sign up for a VIP account to access premium features
            </CardDescription>
          </CardHeader>
          
          <div className="mx-4 bg-muted/50 p-3 rounded-lg my-2">
            <div className="font-medium">{planDetails.name}</div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">{planDetails.price}</div>
              <div className="text-sm text-muted-foreground">{planDetails.billing}</div>
            </div>
          </div>
          
          <CardContent>
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
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Continue to Payment'}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have a VIP account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-500"
                onClick={() => navigate('/vip-login')}
              >
                Log in
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VipSignup;
