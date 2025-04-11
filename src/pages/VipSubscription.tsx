
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, ChevronLeft } from 'lucide-react';
import VipPricingDisplay from '@/components/vip/VipPricingDisplay';

const VipSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual' | null>(null);

  const handleBackClick = () => {
    navigate(-1);
  };
  
  const handlePlanSelect = (plan: 'monthly' | 'semiannual' | 'annual') => {
    setSelectedPlan(plan);
  };
  
  const handleContinue = () => {
    if (!selectedPlan) return;
    navigate('/vip-payment', { state: { plan: selectedPlan } });
  };

  const getBorderClass = (plan: 'monthly' | 'semiannual' | 'annual') => {
    return selectedPlan === plan ? 'border-amber-500 dark:border-amber-400' : '';
  };
  
  const getButtonClass = (plan: 'monthly' | 'semiannual' | 'annual') => {
    return selectedPlan === plan 
      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
      : 'bg-transparent text-amber-500 border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900';
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">VIP Subscription</h1>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Crown className="h-5 w-5 text-amber-500 mr-2" />
          Select Your VIP Plan
        </h2>
        <p className="text-muted-foreground">
          Choose the VIP plan that works best for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Monthly Plan */}
        <Card className={`flex flex-col border-2 ${getBorderClass('monthly')} cursor-pointer hover:border-amber-300`}
          onClick={() => handlePlanSelect('monthly')}>
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Basic VIP access with monthly billing</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">
              <VipPricingDisplay plan="monthly" />
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Unlimited image messages</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>120 voice messages per month</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>30-day billing cycle</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className={`w-full ${getButtonClass('monthly')}`}>
              Select Monthly
            </Button>
          </CardFooter>
        </Card>

        {/* Semi-Annual Plan */}
        <Card className={`flex flex-col border-2 ${getBorderClass('semiannual')} cursor-pointer hover:border-amber-300 relative`}
          onClick={() => handlePlanSelect('semiannual')}>
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              POPULAR
            </span>
          </div>
          <CardHeader>
            <CardTitle>Semi-Annual</CardTitle>
            <CardDescription>6 months of VIP benefits at a discount</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">
              <VipPricingDisplay plan="semiannual" />
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Unlimited image messages</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>120 voice messages per month</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Save 16% compared to monthly</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className={`w-full ${getButtonClass('semiannual')}`}>
              Select Semi-Annual
            </Button>
          </CardFooter>
        </Card>

        {/* Annual Plan */}
        <Card className={`flex flex-col border-2 ${getBorderClass('annual')} cursor-pointer hover:border-amber-300`}
          onClick={() => handlePlanSelect('annual')}>
          <CardHeader>
            <CardTitle>Annual</CardTitle>
            <CardDescription>Best value for long-term VIP status</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">
              <VipPricingDisplay plan="annual" />
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Unlimited image messages</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>120 voice messages per month</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Save 40% compared to monthly</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className={`w-full ${getButtonClass('annual')}`}>
              Select Annual
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg"
          disabled={!selectedPlan}
          onClick={handleContinue}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 min-w-[200px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default VipSubscription;
