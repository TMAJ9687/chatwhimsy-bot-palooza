
import React from 'react';
import { Crown } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  isVip: boolean;
}

const UserAvatar = ({ name, isVip }: UserAvatarProps) => {
  return (
    <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-500 dark:text-amber-400 mr-3">
      {name.charAt(0)}
      {isVip && (
        <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full w-4 h-4 flex items-center justify-center">
          <Crown className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
