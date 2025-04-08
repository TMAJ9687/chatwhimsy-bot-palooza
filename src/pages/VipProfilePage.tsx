
import React from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VipProfilePage: React.FC = () => {
  const { user, cancelVipSubscription } = useUser();

  if (!user) {
    return <div>Loading VIP profile...</div>;
  }

  if (!user.isVip) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <h1 className="text-2xl font-bold mb-4">VIP Access Required</h1>
            <p className="text-center mb-6">
              You need to be a VIP member to access this page.
            </p>
            <Button>Upgrade to VIP</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your VIP Profile</h1>
        <Badge variant="default" className="bg-amber-500">VIP</Badge>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>VIP Membership Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Tier</p>
            <p className="font-medium">{user.subscriptionTier}</p>
          </div>
          
          {user.subscriptionEndDate && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiration Date</p>
              <p className="font-medium">
                {new Date(user.subscriptionEndDate).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">VIP Benefits</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Unlimited messages</li>
              <li>Image sharing ({user.imagesRemaining} remaining)</li>
              <li>Voice messages ({user.voiceMessagesRemaining} remaining)</li>
              <li>Access to exclusive features</li>
            </ul>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button className="flex-1">Renew Subscription</Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => cancelVipSubscription()}
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nickname</p>
            <p className="font-medium">{user.nickname}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <Button className="w-full">Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VipProfilePage;
