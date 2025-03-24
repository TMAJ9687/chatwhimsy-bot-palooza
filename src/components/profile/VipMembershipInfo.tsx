
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useDialog } from '@/context/DialogContext';
import { format } from 'date-fns';
import { Crown, Calendar, Award, Trash, Shield, Globe, MessageSquare, Search, HeartHandshake, Clock, UserCheck } from 'lucide-react';

const VipMembershipInfo = () => {
  const { user, isVip } = useUser();
  const { openDialog } = useDialog();

  // Format the subscription end date if it exists
  const formattedEndDate = user?.subscriptionEndDate 
    ? format(new Date(user.subscriptionEndDate), 'MMMM d, yyyy')
    : 'Not Available';

  const handleDeleteAccount = () => {
    openDialog('accountDeletion');
  };

  const getSubscriptionLabel = (tier: string | undefined) => {
    switch(tier) {
      case 'monthly':
        return 'Monthly Plan';
      case 'semiannual':
        return '6-Month Plan';
      case 'annual':
        return 'Annual Plan';
      default:
        return 'None';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md border-amber-100 dark:border-amber-900/40">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center space-x-2">
          <Crown className="h-6 w-6" />
          <CardTitle className="text-xl">VIP Membership</CardTitle>
        </div>
        <CardDescription className="text-white/80">
          Enjoy exclusive benefits and features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Membership details */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Award className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Subscription Tier</h3>
              <p className="text-sm text-muted-foreground">
                {getSubscriptionLabel(user?.subscriptionTier)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Expires On</h3>
              <p className="text-sm text-muted-foreground">
                {formattedEndDate}
              </p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="border-t pt-4">
          <h3 className="font-medium flex items-center mb-3">
            <Crown className="h-4 w-4 text-amber-500 mr-2" />
            VIP Features
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Unlimited image sharing</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Voice message support</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Chat history view</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Find matches by interests</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Priority customer support</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Ad-free experience</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Appear at top of the list</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Customized avatars</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Read receipts</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Message delivery status</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Typing indicators</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
              <span>Premium conversation starters</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          className="w-full flex items-center justify-center" 
          onClick={handleDeleteAccount}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VipMembershipInfo;
