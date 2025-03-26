
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/shared/ThemeToggle';
import PlanDetails from '@/components/vip/PlanDetails';
import VipSignupForm, { SignupFormValues } from '@/components/vip/VipSignupForm';

const VipSignup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get('plan') || 'monthly';
  
  // Redirect to plan selection if no plan is selected
  React.useEffect(() => {
    if (!selectedPlan) {
      navigate('/vip-subscription');
    }
  }, [selectedPlan, navigate]);

  const handleSignup = (values: SignupFormValues) => {
    // Navigate to payment page with form values and plan
    navigate(`/vip-payment?plan=${selectedPlan}&email=${encodeURIComponent(values.email)}&nickname=${encodeURIComponent(values.nickname)}`);
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
          
          <PlanDetails selectedPlan={selectedPlan} />
          
          <CardContent>
            <VipSignupForm 
              selectedPlan={selectedPlan}
              onSubmit={handleSignup}
            />
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
