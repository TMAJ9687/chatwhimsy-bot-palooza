
import React, { useEffect, useRef } from 'react';
import { useDialog } from '@/context/DialogContext';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';
import ReportDialog from './ReportDialog';
import BlockUserDialog from './BlockUserDialog';
import SiteRulesDialog from './SiteRulesDialog';
import LogoutConfirmationDialog from './LogoutConfirmationDialog';
import VipLoginDialog from './VipLoginDialog';
import VipSignupDialog from './VipSignupDialog';
import VipSubscriptionDialog from './VipSubscriptionDialog';
import VipPaymentDialog from './VipPaymentDialog';
import VipConfirmationDialog from './VipConfirmationDialog';
import AccountDeletionDialog from './AccountDeletionDialog';
import VipSelectDialog from './VipSelectDialog';
import ConfirmDialog from './ConfirmDialog';
import AlertDialogComponent from './AlertDialog';

// This component renders the appropriate dialog based on the current dialog state
const DialogContainer = () => {
  const { state } = useDialog();
  const { cleanupOverlays } = useSafeDOMOperations();
  const prevDialogTypeRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Cleanup overlays when dialog state changes
  useEffect(() => {
    // Clean up any previous cleanup timer
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // If dialog changed from open to closed, clean up overlays
    if (prevDialogTypeRef.current !== null && !state.isOpen) {
      timeoutRef.current = window.setTimeout(() => {
        cleanupOverlays();
        timeoutRef.current = null;
      }, 300); // Delay to allow animations to complete
    }
    
    // Track the previous dialog type
    prevDialogTypeRef.current = state.isOpen ? state.type || null : null;
    
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [state.isOpen, state.type, cleanupOverlays]);
  
  if (!state.isOpen) {
    return null;
  }

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
};

export default DialogContainer;
