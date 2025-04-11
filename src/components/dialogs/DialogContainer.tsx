
import React, { Suspense, lazy } from 'react';
import { useDialog } from '@/context/DialogContext';
import LogoutErrorBoundary from '@/components/error/LogoutErrorBoundary';

// Import frequently used dialogs directly
import LogoutConfirmationDialog from './LogoutConfirmationDialog';
import VipSelectDialog from './VipSelectDialog';

// Simple loading fallback
const DialogFallback = () => (
  <div className="bg-background rounded-lg p-4 shadow-lg animate-pulse">
    <div className="h-6 w-32 bg-gray-200 mb-4 rounded"></div>
    <div className="h-4 w-64 bg-gray-200 mb-2 rounded"></div>
    <div className="h-4 w-48 bg-gray-200 rounded"></div>
  </div>
);

// Lazy load other dialogs
const ConfirmDialog = lazy(() => import('./ConfirmDialog'));
const AlertDialog = lazy(() => import('./AlertDialog'));
const PromptDialog = lazy(() => import('./PromptDialog'));
const SelectDialog = lazy(() => import('./SelectDialog'));
const UserEditDialog = lazy(() => import('./UserEditDialog'));
const VipDurationDialog = lazy(() => import('./VipDurationDialog'));
const VipConfirmDialog = lazy(() => import('./VipConfirmDialog'));
const VipDowngradeDialog = lazy(() => import('./VipDowngradeDialog'));
const VipSubscriptionDialog = lazy(() => import('./VipSubscriptionDialog'));
const VipPaymentDialog = lazy(() => import('./VipPaymentDialog'));
const VipConfirmationDialog = lazy(() => import('./VipConfirmationDialog'));

const DialogContainer: React.FC = () => {
  const { state } = useDialog();
  
  if (!state.isOpen) {
    return null;
  }

  // Wrap logout dialog with error boundary
  if (state.type === 'logout') {
    return (
      <LogoutErrorBoundary>
        <LogoutConfirmationDialog />
      </LogoutErrorBoundary>
    );
  }
  
  // Render VIP select dialog without suspense
  if (state.type === 'vipSelect') {
    return <VipSelectDialog />;
  }

  return (
    <Suspense fallback={<DialogFallback />}>
      {(() => {
        switch (state.type) {
          case 'confirm':
            return <ConfirmDialog />;
          case 'alert':
            return <AlertDialog />;
          case 'prompt':
            return <PromptDialog />;
          case 'select':
            return <SelectDialog />;
          case 'userEdit':
            return <UserEditDialog />;
          case 'vipDuration':
            return <VipDurationDialog />;
          case 'vipConfirm':
            return <VipConfirmDialog />;
          case 'vipDowngrade':
            return <VipDowngradeDialog />;
          case 'vipSubscription':
            return <VipSubscriptionDialog />;
          case 'vipPayment':
            return <VipPaymentDialog />;
          case 'vipConfirmation':
            return <VipConfirmationDialog />;
          default:
            return null;
        }
      })()}
    </Suspense>
  );
};

export default DialogContainer;
