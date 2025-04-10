
import React, { memo, useEffect, Suspense, useRef } from 'react';
import { useDialog } from '@/context/DialogContext';
import { trackEvent } from '@/utils/performanceMonitor';
import LogoutErrorBoundary from '@/components/error/LogoutErrorBoundary'; 

// Import dialogs normally instead of lazy loading for critical ones
import SiteRulesDialog from './SiteRulesDialog';
import LogoutConfirmationDialog from './LogoutConfirmationDialog';
import ConfirmDialog from './ConfirmDialog';
import AlertDialogComponent from './AlertDialog';
import UserEditDialog from './UserEditDialog';

// Using lazy loading for all other dialogs to reduce initial load time
const ReportDialog = React.lazy(() => import('./ReportDialog'));
const BlockUserDialog = React.lazy(() => import('./BlockUserDialog'));
const VipLoginDialog = React.lazy(() => import('./VipLoginDialog'));
const VipSignupDialog = React.lazy(() => import('./VipSignupDialog'));
const VipSubscriptionDialog = React.lazy(() => import('./VipSubscriptionDialog'));
const VipPaymentDialog = React.lazy(() => import('./VipPaymentDialog'));
const VipConfirmationDialog = React.lazy(() => import('./VipConfirmationDialog'));
const AccountDeletionDialog = React.lazy(() => import('./AccountDeletionDialog'));
const VipSelectDialog = React.lazy(() => import('./VipSelectDialog'));
const PromptDialog = React.lazy(() => import('./PromptDialog'));
const SelectDialog = React.lazy(() => import('./SelectDialog'));

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
 */
const DialogContainer = () => {
  // Use try/catch to handle potential context errors gracefully
  let dialogState = { isOpen: false, type: null };
  let closeDialog = () => {};
  
  try {
    const dialogContext = useDialog();
    dialogState = dialogContext.state;
    closeDialog = dialogContext.closeDialog;
  } catch (error) {
    console.error('Error accessing dialog context:', error);
    return null;
  }
  
  const mountedRef = useRef(true);
  const activeDialogTypeRef = useRef<string | null>(null);
  const renderAttemptedRef = useRef(false);
  
  // Track when component unmounts to prevent setState after unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      activeDialogTypeRef.current = null;
    };
  }, []);
  
  // Apply body style changes when dialog opens/closes
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (dialogState.isOpen && !renderAttemptedRef.current) {
      // Apply body styles for open dialog
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
      renderAttemptedRef.current = true;
      
      // Track the currently active dialog type to help with cleanup
      activeDialogTypeRef.current = dialogState.type;
      try {
        trackEvent(`dialog-render-${dialogState.type}`, () => {});
      } catch (e) {
        console.warn('Failed to track dialog event:', e);
      }
    } else if (!dialogState.isOpen && renderAttemptedRef.current) {
      // Only restore body state if we were the ones who changed it
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open');
      renderAttemptedRef.current = false;
      activeDialogTypeRef.current = null;
    }
  }, [dialogState.isOpen, dialogState.type]);

  // Don't render anything if not open or component is unmounting
  if (!dialogState.isOpen || !mountedRef.current) {
    return null;
  }

  // Simple dialogs rendered without suspense for immediate loading
  if (dialogState.type === 'logout') {
    return (
      <LogoutErrorBoundary>
        <LogoutConfirmationDialog key="logout" />
      </LogoutErrorBoundary>
    );
  }

  if (dialogState.type === 'siteRules') {
    try {
      return <SiteRulesDialog key="siteRules" />;
    } catch (error) {
      console.error('Error rendering SiteRulesDialog:', error);
      return null;
    }
  }

  if (dialogState.type === 'confirm') {
    try {
      return <ConfirmDialog key="confirm" />;
    } catch (error) {
      console.error('Error rendering ConfirmDialog:', error);
      return null;
    }
  }

  if (dialogState.type === 'alert') {
    try {
      return <AlertDialogComponent key="alert" />;
    } catch (error) {
      console.error('Error rendering AlertDialog:', error);
      return null;
    }
  }

  if (dialogState.type === 'userEdit') {
    try {
      return <UserEditDialog key="userEdit" />;
    } catch (error) {
      console.error('Error rendering UserEditDialog:', error);
      return null;
    }
  }

  return (
    <Suspense fallback={<DialogFallback />}>
      {(() => {
        // Don't render anything if component is unmounting
        if (!mountedRef.current) return null;
        
        // Render the appropriate dialog component based on the dialog type
        switch (dialogState.type) {
          case 'report':
            return <ReportDialog key="report" />;
          case 'block':
            return <BlockUserDialog key="block" />;
          case 'vipLogin':
            return <VipLoginDialog key="vipLogin" />;
          case 'vipSignup':
            return <VipSignupDialog key="vipSignup" />;
          case 'vipSubscription':
            return <VipSubscriptionDialog key="vipSubscription" />;
          case 'vipPayment':
            return <VipPaymentDialog key="vipPayment" />;
          case 'vipConfirmation':
            return <VipConfirmationDialog key="vipConfirmation" />;
          case 'accountDeletion':
            return <AccountDeletionDialog key="accountDeletion" />;
          case 'vipSelect':
            return <VipSelectDialog key="vipSelect" />;
          case 'prompt':
            return <PromptDialog key="prompt" />;
          case 'select':
            return <SelectDialog key="select" />;
          default:
            return null;
        }
      })()}
    </Suspense>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(DialogContainer);
