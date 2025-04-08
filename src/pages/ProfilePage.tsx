
import React from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfilePage: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Card className="mb-6">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
              <p className="font-medium">{user.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
              <p className="font-medium">{user.gender}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
            <p className="font-medium">{user.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interests</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {user.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
          <Button className="w-full mt-4">Edit Profile</Button>
        </CardContent>
      </Card>
      
      {user.isVip && (
        <Card>
          <CardHeader>
            <CardTitle>VIP Membership</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You are currently a VIP member.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Subscription Tier: {user.subscriptionTier}
            </p>
            {user.subscriptionEndDate && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expires on: {new Date(user.subscriptionEndDate).toLocaleDateString()}
              </p>
            )}
            <Button variant="outline" className="mt-4">Manage Subscription</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
