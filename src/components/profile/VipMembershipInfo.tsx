
import React from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/context/DialogContext';
import { Crown, Check, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const VipMembershipInfo = () => {
  const { user, isVip } = useUser();
  const { openDialog } = useDialog();
  
  // Format dates for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'MMM d, yyyy');
  };
  
  const today = new Date();
  const subscriptionStart = user?.subscriptionEndDate 
    ? new Date(user.subscriptionEndDate.getTime()) 
    : today;
  
  // For demo purposes, set start date to 30 days before end date
  subscriptionStart.setDate(subscriptionStart.getDate() - 30);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md border-amber-100 dark:border-amber-900/40">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <Crown className="w-5 h-5 text-amber-500 mr-2" />
          <h2 className="text-xl font-semibold">Membership Info</h2>
        </div>
        
        {/* Current plan */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Plan</h3>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide opacity-80">VIP Subscription</div>
                <div className="text-xl font-bold mt-1">{user?.subscriptionTier === 'monthly' ? 'Monthly' : user?.subscriptionTier === 'semiannual' ? 'Semi-Annual' : 'Annual'} Plan</div>
              </div>
              <Sparkles className="w-6 h-6 opacity-90" />
            </div>
          </div>
        </div>
        
        {/* Subscription dates */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center text-sm font-medium mb-1">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
              Start Date
            </div>
            <div className="text-base pl-6">{formatDate(subscriptionStart)}</div>
          </div>
          
          <div>
            <div className="flex items-center text-sm font-medium mb-1">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
              Expiration Date
            </div>
            <div className="text-base pl-6">{formatDate(user?.subscriptionEndDate)}</div>
          </div>
          
          <div className="pt-2">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm">
              <div className="flex">
                <CreditCard className="w-4 h-4 mr-1.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-amber-800 dark:text-amber-300">Auto-Renewal:</span>
                  <span className="ml-1 text-amber-700 dark:text-amber-400">Your subscription will renew automatically unless canceled.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* VIP benefits */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">VIP Benefits</h3>
          <div className="space-y-2.5">
            {[
              'Send unlimited photos',
              'Send unlimited voice messages',
              'Chat history view',
              'Find matches by interests',
              'Customer Support',
              'Customized avatars',
              'Appear at top of the list',
              'Ad free experience'
            ].map((benefit, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-0.5 mr-2 mt-0.5">
                  <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Management buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => openDialog('vipSubscription')}
            variant="outline" 
            className="w-full border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
          >
            <CreditCard className="mr-2 h-4 w-4 text-amber-500" />
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VipMembershipInfo;
