
import React from 'react';
import { Crown } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  isVip: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar = ({ 
  name, 
  isVip, 
  size = 'md', 
  className = "" 
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const vipBadgeClasses = {
    sm: '-top-1 -right-1 w-3.5 h-3.5',
    md: '-top-1 -right-1 w-4 h-4',
    lg: '-top-1.5 -right-1.5 w-5 h-5'
  };

  const iconSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3'
  };

  return (
    <div className={`${sizeClasses[size]} relative bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-500 dark:text-amber-400 ${className}`}>
      {name.charAt(0)}
      {isVip && (
        <div className={`absolute ${vipBadgeClasses[size]} bg-amber-400 rounded-full flex items-center justify-center`}>
          <Crown className={iconSizes[size]} />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
