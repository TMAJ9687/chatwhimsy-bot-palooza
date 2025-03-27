
import React from 'react';

interface UserAvatarProps {
  name: string;
  isVip: boolean;
}

const UserAvatar = ({ name, isVip }: UserAvatarProps) => {
  return (
    <div className={`w-9 h-9 ${isVip ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'} rounded-full flex items-center justify-center font-bold ${isVip ? 'text-amber-500 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'} mr-3`}>
      {name.charAt(0)}
    </div>
  );
};

export default UserAvatar;
