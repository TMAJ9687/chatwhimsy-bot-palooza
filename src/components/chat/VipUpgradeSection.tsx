
import React, { memo } from 'react';
import { Crown } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';

const VipUpgradeSection = () => {
  const { openDialog } = useDialog();
  const { isVip } = useUser();

  const handleUpgradeClick = () => {
    openDialog('vipLogin');
  };

  if (isVip) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-800 dark:text-gray-200">VIP Status Active</div>
          </div>
          <button 
            onClick={() => openDialog('vipSubscription')}
            className="px-3 py-1 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            Manage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-800 dark:text-gray-200">Unlock all features</div>
        </div>
        <button 
          onClick={handleUpgradeClick}
          className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
};

export default memo(VipUpgradeSection);
