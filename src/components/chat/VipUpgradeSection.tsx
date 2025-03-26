
import React, { memo } from 'react';
import { Crown, Sparkles, User } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';

const VipUpgradeSection = () => {
  const { openDialog } = useDialog();
  const { isVip } = useUser();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    // Show the VIP selection dialog instead of going directly to subscription
    openDialog('vipSelect');
  };

  const handleProfileClick = () => {
    navigate('/vip-profile');
  };

  if (isVip) {
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">VIP Status Active</div>
            <div className="text-xs text-muted-foreground">All premium features unlocked</div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleProfileClick}
              className="px-3 py-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button 
              onClick={() => openDialog('vipSubscription')}
              className="px-3 py-1 rounded-md border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
