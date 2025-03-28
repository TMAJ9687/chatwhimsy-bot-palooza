
import React, { memo, useEffect, Suspense, useRef } from 'react';
import { useDialog } from '@/context/DialogContext';
import { trackEvent } from '@/utils/performanceMonitor';

// Import dialogs normally instead of lazy loading for critical ones
import SiteRulesDialog from './SiteRulesDialog';
import LogoutConfirmationDialog from './LogoutConfirmationDialog';

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
const ConfirmDialog = React.lazy(() => import('./ConfirmDialog'));
const AlertDialogComponent = React.lazy(() => import('./AlertDialog'));

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
 * Critical dialogs (SiteRules and LogoutConfirmation) are imported directly
 * to avoid dynamic import issues
 */
const DialogContainer = () => {
  const { state } = useDialog();
  const mountedRef = useRef(true);
  const activeDialogTypeRef = useRef<string | null>(null);
  
  // Track when component unmounts to prevent setState after unmount
  useEffect(() => {
    mountedRef.current = true;
    
    // Enhanced cleanup on unmount
    return () => {
      mountedRef.current = false;
      activeDialogTypeRef.current = null;
      
      // Cleanup any stuck dialog elements
      if (typeof document !== 'undefined') {
        try {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        } catch (e) {
          // Ignore any errors during emergency cleanup
        }
      }
    };
  }, []);
  
  // Track dialog rendering for performance monitoring
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (state.isOpen) {
      // Track the currently active dialog type to help with cleanup
      activeDialogTypeRef.current = state.type;
      trackEvent(`dialog-render-${state.type}`, () => {});
    } else {
      activeDialogTypeRef.current = null;
    }
  }, [state.isOpen, state.type]);

  // Don't render anything if not open or component is unmounting
  if (!state.isOpen || !mountedRef.current) {
    return null;
  }

  // Special case for directly imported dialogs - render without Suspense
  // and with enhanced error handling
  if (state.type === 'siteRules') {
    try {
      return <SiteRulesDialog key="siteRules" />;
    } catch (error) {
      console.error('Error rendering SiteRulesDialog:', error);
      return null;
    }
  }
  
  if (state.type === 'logout') {
    try {
      // Console log for debugging
      console.log('Rendering LogoutConfirmationDialog with state:', state);
      return <LogoutConfirmationDialog key="logout" />;
    } catch (error) {
      console.error('Error rendering LogoutConfirmationDialog:', error);
      return null;
    }
  }

  return (
    <Suspense fallback={<DialogFallback />}>
      {(() => {
        // Don't render anything if component is unmounting
        if (!mountedRef.current) return null;
        
        // Render the appropriate dialog component based on the dialog type
        // Adding keys to help React better track component identity
        switch (state.type) {
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
          case 'confirm':
            return <ConfirmDialog key="confirm" />;
          case 'alert':
            return <AlertDialogComponent key="alert" />;
          default:
            return null;
        }
      })()}
    </Suspense>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(DialogContainer);
