
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, isVip } = useUser();
  const { toast } = useToast();
  
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Error',
        description: 'Nickname cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update user profile
      updateUserProfile({ nickname });
      
      toast({
        title: 'Success',
        description: 'Account settings updated successfully',
      });
      
      // Redirect to chat after a short delay
      setTimeout(() => navigate('/chat'), 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <Button 
          variant="outline" 
          onClick={() => navigate('/chat')}
        >
          Back to Chat
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  id="nickname"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              
              {user && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Membership Status
                    </label>
                    <div className="p-3 bg-muted rounded-md">
                      {isVip ? (
                        <span className="flex items-center text-green-500">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          VIP Member
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Standard User
                          <Button
                            variant="link"
                            className="ml-2 text-primary"
                            onClick={() => navigate('/vip-subscription')}
                          >
                            Upgrade to VIP
                          </Button>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isVip && user.subscriptionEndDate && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subscription Ends
                      </label>
                      <div className="p-3 bg-muted rounded-md">
                        {new Date(user.subscriptionEndDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Privacy & Security</h2>
            
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/terms')}
              >
                View Terms of Service
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/privacy')}
              >
                View Privacy Policy
              </Button>
              
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => {
                  // This would typically open a confirmation dialog
                  // For this example, we'll just show a toast
                  toast({
                    title: 'Account Deletion',
                    description: 'This feature is not implemented in the demo.',
                    variant: 'destructive',
                  });
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AccountSettings;
