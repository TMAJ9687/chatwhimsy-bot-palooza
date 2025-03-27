
import React from 'react';

interface VipStatusBarProps {
  isVip: boolean;
  imagesRemaining: number;
}

const VipStatusBar: React.FC<VipStatusBarProps> = ({ isVip, imagesRemaining }) => {
  return (
    <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-1">
      {!isVip && `${imagesRemaining} image uploads remaining today - `}
      {isVip 
        ? "VIP Member - Longer messages and unlimited uploads" 
        : "Upgrade to VIP for longer messages and unlimited uploads"
      }
    </div>
  );
};

export default VipStatusBar;
