
import React from 'react';
import { Crown } from 'lucide-react';
import { STANDARD_CHAR_LIMIT, VIP_CHAR_LIMIT } from '@/hooks/useVipFeatures';

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
          <span>VIP Member - {VIP_CHAR_LIMIT} char messages, unlimited uploads, voice messages</span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <span>
            {imagesRemaining < Infinity ? `${imagesRemaining} image uploads remaining today - ` : ''}
            Standard account: {STANDARD_CHAR_LIMIT} char limit
          </span>
          <span className="text-amber-500 hover:underline cursor-pointer">
            Upgrade to VIP for longer messages and unlimited uploads
          </span>
        </div>
      )}
    </div>
  );
};

export default VipStatusBar;
