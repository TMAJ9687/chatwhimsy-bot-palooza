
import React, { memo, useEffect, lazy, Suspense } from 'react';
import { useDialog } from '@/context/DialogContext';
import { trackEvent } from '@/utils/performanceMonitor';

// Using lazy loading for all dialogs to reduce initial load time
const ReportDialog = lazy(() => import('./ReportDialog'));
const BlockUserDialog = lazy(() => import('./BlockUserDialog'));
const SiteRulesDialog = lazy(() => import('./SiteRulesDialog'));
const LogoutConfirmationDialog = lazy(() => import('./LogoutConfirmationDialog'));
const VipLoginDialog = lazy(() => import('./VipLoginDialog'));
const VipSignupDialog = lazy(() => import('./VipSignupDialog'));
const VipSubscriptionDialog = lazy(() => import('./VipSubscriptionDialog'));
const VipPaymentDialog = lazy(() => import('./VipPaymentDialog'));
const VipConfirmationDialog = lazy(() => import('./VipConfirmationDialog'));
const AccountDeletionDialog = lazy(() => import('./AccountDeletionDialog'));
const VipSelectDialog = lazy(() => import('./VipSelectDialog'));
const ConfirmDialog = lazy(() => import('./ConfirmDialog'));
const AlertDialogComponent = lazy(() => import('./AlertDialog'));

// Loading fallback component - lightweight and minimal
const DialogFallback = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-4 shadow-lg animate-pulse">
      <div className="h-6 w-32 bg-gray-200 mb-4 rounded"></div>
      <div className="h-4 w-64 bg-gray-200 mb-2 rounded"></div>
      <div className="h-4 w-48 bg-gray-200 rounded"></div>
    </div>
  </div>
);

/**
 * This component renders the appropriate dialog based on the current dialog state
 * Each dialog component is lazily rendered only when needed
 */
const DialogContainer = () => {
  const { state } = useDialog();
  
  // Track dialog rendering for performance monitoring
  useEffect(() => {
    if (state.isOpen) {
      trackEvent(`dialog-render-${state.type}`, () => {});
    }
  }, [state.isOpen, state.type]);

  if (!state.isOpen) {
    return null;
  }

  return (
    <Suspense fallback={<DialogFallback />}>
      {(() => {
        // Render the appropriate dialog component based on the dialog type
        switch (state.type) {
          case 'report':
            return <ReportDialog />;
          case 'block':
            return <BlockUserDialog />;
          case 'siteRules':
            return <SiteRulesDialog />;
          case 'logout':
            return <LogoutConfirmationDialog />;
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
          case 'accountDeletion':
            return <AccountDeletionDialog />;
          case 'vipSelect':
            return <VipSelectDialog />;
          case 'confirm':
            return <ConfirmDialog />;
          case 'alert':
            return <AlertDialogComponent />;
          default:
            return null;
        }
      })()}
    </Suspense>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(DialogContainer);
