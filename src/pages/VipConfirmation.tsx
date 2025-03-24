
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Crown } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';

const VipConfirmation = () => {
  const navigate = useNavigate();
  const { isVip } = useUser();
  
  // If not VIP, redirect to signup
  React.useEffect(() => {
    if (!isVip) {
      navigate('/vip-subscription');
    }
  }, [isVip, navigate]);
  
  const handleContinueToProfile = () => {
    navigate('/vip-profile');
  };
  
  const handleGoToChat = () => {
    navigate('/chat');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>
        
        <Card className="border-amber-100 dark:border-amber-900/40 shadow-lg">
          <CardHeader className="pb-2 pt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-center">Welcome to VIP!</h1>
            <p className="text-center text-muted-foreground mt-2">
              Your payment was successful and your VIP account is now active.
            </p>
          </CardHeader>
          
          <CardContent className="py-6">
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                <Crown className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">VIP Status Activated</h3>
                  <p className="text-sm text-muted-foreground">
                    You now have access to all premium features and benefits.
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Your VIP Benefits:</h3>
                <ul className="text-sm space-y-2">
                  {[
                    'Unlimited photos & voice messages',
                    'Message status indicators & chat history',
                    'Ad-free experience',
                    'Priority customer support',
                    'Appear at the top of user lists',
                    'And much more!'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email with your receipt and subscription details.
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 pb-6">
            <Button 
              onClick={handleContinueToProfile}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 h-auto"
            >
              Complete Your VIP Profile
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoToChat}
              className="w-full"
            >
              Start Chatting
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VipConfirmation;
