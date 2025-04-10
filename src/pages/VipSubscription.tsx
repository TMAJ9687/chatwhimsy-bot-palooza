import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, Shield } from 'lucide-react';
import { useVipPricing } from '@/hooks/useVipPricing';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionTier } from '@/types/user';
import ThemeToggle from '@/components/shared/ThemeToggle';

const VipSubscription = () => {
  const navigate = useNavigate();
  const { prices, monthlyPrice, semiannualPrice, annualPrice, loading } = useVipPricing();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('monthly');
  
  const handleSubscribe = (tier: SubscriptionTier) => {
    // Navigate to payment page with tier information
    navigate('/vip-payment', { state: { tier } });
  };
  
  const discountPercentage = (tier: SubscriptionTier): number => {
    if (tier === 'annual') {
      return Math.floor(100 - ((prices.annual / (prices.monthly * 12)) * 100));
    } else if (tier === 'semiannual') {
      return Math.floor(100 - ((prices.semiannual / (prices.monthly * 6)) * 100));
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 py-10">
      <div className="container max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="text-yellow-500 h-8 w-8" />
              VIP Subscription
            </h1>
            <p className="text-muted-foreground">Choose the plan that works best for you</p>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 my-8">
          {/* Monthly Plan */}
          <Card className={`border-2 transition-all ${selectedTier === 'monthly' ? 'border-primary shadow-lg' : 'border-border'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Monthly
                {selectedTier === 'monthly' && <CheckCircle className="h-5 w-5 text-primary" />}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{loading ? '$--' : monthlyPrice}</span>
                <span className="text-muted-foreground"> /month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">Perfect if you want to try out VIP benefits</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Unlimited photo uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Voice messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setSelectedTier('monthly');
                  handleSubscribe('monthly');
                }} 
                className={`w-full ${selectedTier === 'monthly' ? 'bg-primary' : 'bg-muted'}`}
                variant={selectedTier === 'monthly' ? 'default' : 'outline'}
              >
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>
          
          {/* Semi-annual Plan */}
          <Card className={`border-2 transition-all ${selectedTier === 'semiannual' ? 'border-primary shadow-lg' : 'border-border'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Semi-annual</CardTitle>
                {selectedTier === 'semiannual' && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{loading ? '$--' : semiannualPrice}</span>
                <span className="text-muted-foreground"> /6 months</span>
                <div className="mt-1">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded text-xs">
                    Save {discountPercentage('semiannual')}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">Best value for committed users</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>All monthly benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Longer voice messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Exclusive emojis</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setSelectedTier('semiannual');
                  handleSubscribe('semiannual');
                }} 
                className={`w-full ${selectedTier === 'semiannual' ? 'bg-primary' : 'bg-muted'}`}
                variant={selectedTier === 'semiannual' ? 'default' : 'outline'}
              >
                Subscribe Semi-annually
              </Button>
            </CardFooter>
          </Card>
          
          {/* Annual Plan */}
          <Card className={`border-2 transition-all ${selectedTier === 'annual' ? 'border-primary shadow-lg' : 'border-border bg-muted/20'}`}>
            <div className="absolute inset-x-0 -top-2 flex justify-center">
              <span className="bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-semibold">
                Best Value
              </span>
            </div>
            <CardHeader className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle>Annual</CardTitle>
                {selectedTier === 'annual' && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{loading ? '$--' : annualPrice}</span>
                <span className="text-muted-foreground"> /year</span>
                <div className="mt-1">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded text-xs">
                    Save {discountPercentage('annual')}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">Maximum savings and all premium features</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>All semi-annual benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Custom user badges</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span>Premium interface themes</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setSelectedTier('annual');
                  handleSubscribe('annual');
                }} 
                className={`w-full ${selectedTier === 'annual' ? 'bg-primary' : 'bg-muted'}`}
                variant={selectedTier === 'annual' ? 'default' : 'outline'}
              >
                Subscribe Annually
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8 bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">All VIP Plans Include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Unlimited photo uploads',
              'Voice message capability',
              'Message status indicators',
              'Longer messages (200 characters)',
              'Priority customer support',
              'Custom avatars',
              'Message timestamps',
              'No advertisements',
              'Enhanced privacy options'
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipSubscription;
