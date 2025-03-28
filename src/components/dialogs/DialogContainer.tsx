
import React, { memo, useEffect, Suspense, useRef } from 'react';
import { useDialog } from '@/context/DialogContext';
import { trackEvent } from '@/utils/performanceMonitor';

// Import SiteRulesDialog normally instead of lazy loading it
import SiteRulesDialog from './SiteRulesDialog';

// Using lazy loading for all other dialogs to reduce initial load time
const ReportDialog = React.lazy(() => import('./ReportDialog'));
const BlockUserDialog = React.lazy(() => import('./BlockUserDialog'));
const LogoutConfirmationDialog = React.lazy(() => import('./LogoutConfirmationDialog'));
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
 * Each dialog component is lazily rendered only when needed, except for SiteRulesDialog
 * which is imported normally to avoid dynamic import issues
 */
const DialogContainer = () => {
  const { state } = useDialog();
  const mountedRef = useRef(true);
  
  // Track when component unmounts to prevent setState after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Track dialog rendering for performance monitoring
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (state.isOpen) {
      trackEvent(`dialog-render-${state.type}`, () => {});
    }
  }, [state.isOpen, state.type]);

  if (!state.isOpen || !mountedRef.current) {
    return null;
  }

  // Special case for SiteRulesDialog - render directly without Suspense
  if (state.type === 'siteRules') {
    return <SiteRulesDialog />;
  }

  return (
    <Suspense fallback={<DialogFallback />}>
      {(() => {
        // Don't render anything if component is unmounting
        if (!mountedRef.current) return null;
        
        // Render the appropriate dialog component based on the dialog type
        switch (state.type) {
          case 'report':
            return <ReportDialog />;
          case 'block':
            return <BlockUserDialog />;
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
