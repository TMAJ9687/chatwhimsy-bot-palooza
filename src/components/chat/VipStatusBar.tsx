
import React from 'react';
import { Crown } from 'lucide-react';

interface VipStatusBarProps {
  isVip: boolean;
  imagesRemaining: number;
}

const VipStatusBar: React.FC<VipStatusBarProps> = ({ isVip, imagesRemaining }) => {
  return (
    <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-1">
      {isVip ? (
        <div className="flex items-center justify-center">
          <Crown className="h-3 w-3 text-amber-500 mr-1" />
          <span>VIP Member - 200 char messages, unlimited uploads, voice messages</span>
        </div>
      ) : (
        <>
          {imagesRemaining < Infinity && `${imagesRemaining} image uploads remaining today - `}
          Upgrade to VIP for longer messages and unlimited uploads
        </>
      )}
    </div>
  );
};

export default VipStatusBar;
