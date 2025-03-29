
import React from 'react';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  onGoToChat: () => void;
  navigationLock: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onGoToChat, navigationLock }) => {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-6 px-4 md:px-8 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">VIP Profile Setup</h1>
        </div>
        <div>
          <Button 
            onClick={onGoToChat} 
            variant="outline" 
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white"
            disabled={navigationLock}
          >
            Go to Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
