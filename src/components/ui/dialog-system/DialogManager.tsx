
import React, { Suspense, lazy } from 'react';
import { useUI } from '@/context/UIContext';

// Import critical dialogs directly
import LogoutConfirmDialog from '@/components/dialogs/LogoutConfirmationDialog';
import SiteRulesDialog from '@/components/dialogs/SiteRulesDialog';
import AlertDialog from '@/components/dialogs/AlertDialog';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog';

// Lazy load other dialogs
const ReportDialog = lazy(() => import('@/components/dialogs/ReportDialog'));
const BlockUserDialog = lazy(() => import('@/components/dialogs/BlockUserDialog'));
const AccountDeletionDialog = lazy(() => import('@/components/dialogs/AccountDeletionDialog'));
const VipLoginDialog = lazy(() => import('@/components/dialogs/VipLoginDialog'));
const VipSignupDialog = lazy(() => import('@/components/dialogs/VipSignupDialog'));
const VipSubscriptionDialog = lazy(() => import('@/components/dialogs/VipSubscriptionDialog'));
const VipPaymentDialog = lazy(() => import('@/components/dialogs/VipPaymentDialog'));
const VipConfirmationDialog = lazy(() => import('@/components/dialogs/VipConfirmationDialog'));
const VipSelectDialog = lazy(() => import('@/components/dialogs/VipSelectDialog'));

// Loading fallback component
const DialogFallback = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg animate-pulse">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 mb-2 rounded"></div>
    </div>
  </div>
);

const DialogManager: React.FC = () => {
  const { state } = useUI();
  const { activeDialog } = state.dialogs;

  // Don't render anything if no dialog is active
  if (!activeDialog) return null;

  // Always render critical dialogs synchronously
  if (activeDialog === 'logout') {
    return <LogoutConfirmDialog />;
  }

  if (activeDialog === 'siteRules') {
    return <SiteRulesDialog />;
  }
  
  if (activeDialog === 'alert') {
    return <AlertDialog />;
  }
  
  if (activeDialog === 'confirm') {
    return <ConfirmDialog />;
  }

  // Lazily load other dialogs
  return (
    <Suspense fallback={<DialogFallback />}>
      {(() => {
        switch (activeDialog) {
          case 'report':
            return <ReportDialog />;
          case 'block':
            return <BlockUserDialog />;
          case 'accountDeletion':
            return <AccountDeletionDialog />;
          case 'vipLogin':
            return <VipLoginDialog />;
          case 'vipSignup':
            return <VipSignupDialog />;
          case 'vipSubscription':
            return <VipSubscriptionDialog />;
          case 'vipPayment':
            return <VipPaymentDialog />;
          case 'vipConfirmation':
            return <VipConfirmationDialog />;
          case 'vipSelect':
            return <VipSelectDialog />;
          default:
            return null;
        }
      })()}
    </Suspense>
  );
};

export default DialogManager;
