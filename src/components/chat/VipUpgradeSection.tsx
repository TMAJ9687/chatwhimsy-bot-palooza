
import React, { memo } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';

const VipUpgradeSection = () => {
  const { openDialog } = useDialog();
  const { isVip } = useUser();

  const handleUpgradeClick = () => {
    // Take users straight to subscription options
    openDialog('vipSubscription');
  };

  if (isVip) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">VIP Status Active</div>
            <div className="text-xs text-muted-foreground">All premium features unlocked</div>
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
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100/50 dark:bg-amber-900/20">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Unlock premium features</div>
          <div className="text-xs text-muted-foreground">Unlimited photos, messages & more</div>
        </div>
        <button 
          onClick={handleUpgradeClick}
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrade</span>
        </button>
      </div>
    </div>
  );
};

export default memo(VipUpgradeSection);
