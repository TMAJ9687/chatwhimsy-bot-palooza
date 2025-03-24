
import React, { memo, lazy, Suspense } from 'react';
import { useDialog } from '@/context/DialogContext';

// Lazy load dialogs to reduce initial bundle size
const ReportDialog = lazy(() => import('./ReportDialog'));
const BlockUserDialog = lazy(() => import('./BlockUserDialog'));
const SiteRulesDialog = lazy(() => import('../chat/SiteRulesDialog'));
const LogoutConfirmationDialog = lazy(() => import('./LogoutConfirmationDialog'));
const VipLoginDialog = lazy(() => import('./VipLoginDialog'));
const VipSignupDialog = lazy(() => import('./VipSignupDialog'));
const VipSubscriptionDialog = lazy(() => import('./VipSubscriptionDialog'));
const VipPaymentDialog = lazy(() => import('./VipPaymentDialog'));
const VipConfirmationDialog = lazy(() => import('./VipConfirmationDialog'));

// Loading fallback component
const DialogLoading = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md text-foreground">Loading...</div>
  </div>
);

// Memoized dialog container to prevent unnecessary re-renders
const DialogContainer = () => {
  const { state } = useDialog();
  
  // Only render when dialog is open
  if (!state.isOpen) return null;
  
  return (
    <Suspense fallback={<DialogLoading />}>
      {state.type === 'report' && <ReportDialog />}
      {state.type === 'block' && <BlockUserDialog />}
      {state.type === 'siteRules' && <SiteRulesDialog />}
      {state.type === 'logout' && <LogoutConfirmationDialog />}
      {state.type === 'vipLogin' && <VipLoginDialog />}
      {state.type === 'vipSignup' && <VipSignupDialog />}
      {state.type === 'vipSubscription' && <VipSubscriptionDialog />}
      {state.type === 'vipPayment' && <VipPaymentDialog />}
      {state.type === 'vipConfirmation' && <VipConfirmationDialog />}
    </Suspense>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(DialogContainer);
