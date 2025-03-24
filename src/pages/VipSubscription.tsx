
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Crown } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';

type SubscriptionTier = {
  id: 'monthly' | 'semiannual' | 'annual';
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  recommended?: boolean;
  billingCycle: string;
};

const VipSubscription = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual'>('annual');
  
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'monthly',
      title: 'Monthly',
      price: '$4.99',
      billingCycle: 'Billed every month',
      description: 'Great for trying out VIP features'
    },
    {
      id: 'semiannual',
      title: 'Semi-Annual',
      price: '$24.99',
      originalPrice: '$29.94',
      discount: '16%',
      billingCycle: 'Billed every six months',
      description: 'Best for regular users'
    },
    {
      id: 'annual',
      title: 'Annual',
      price: '$35.99',
      originalPrice: '$59.88',
      discount: '40%',
      billingCycle: 'Billed once a year',
      description: 'For our most dedicated users',
      recommended: true
    }
  ];

  const handleContinue = () => {
    // Navigate to signup page with selected plan
    navigate(`/vip-signup?plan=${selectedPlan}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBackToHome} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <ThemeToggle />
        </div>
        
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
            <Crown className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your VIP Plan</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock all premium features and enhance your experience with unlimited messages, photos, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {subscriptionTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative overflow-hidden transition-all ${
                selectedPlan === tier.id 
                  ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/10' 
                  : 'hover:border-amber-200 hover:bg-amber-50/20 dark:hover:bg-amber-950/5'
              }`}
              onClick={() => setSelectedPlan(tier.id)}
            >
              {tier.recommended && (
                <div className="absolute top-0 right-0 left-0 bg-amber-500 text-white text-center text-xs py-1 font-medium">
                  Best Value
                </div>
              )}
              
              <CardContent className={`p-6 ${tier.recommended ? 'pt-8' : 'pt-6'}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{tier.title}</h3>
                  <p className="text-sm text-muted-foreground">{tier.billingCycle}</p>
                </div>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold">{tier.price}</div>
                  {tier.originalPrice && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="line-through mr-1">{tier.originalPrice}</span>
                      Save {tier.discount}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {tier.description}
                </p>
                
                <Button 
                  className={`w-full ${
                    selectedPlan === tier.id 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlan(tier.id)}
                >
                  {selectedPlan === tier.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">VIP Benefits</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Send unlimited photos',
              'Send unlimited voice messages',
              'Chat history view',
              'Customer Support',
              'Customized avatars',
              'Appear at top of the list',
              'Ad free experience',
              'React, reply, edit, unsend messages',
              'View message status',
              'Hide your own message status',
              'Control your online status'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            className="px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg"
          >
            Continue with {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VipSubscription;
