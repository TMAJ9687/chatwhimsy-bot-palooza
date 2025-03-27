
import React from 'react';
import { useDialog } from '@/context/DialogContext';
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

/**
 * This component renders the appropriate dialog based on the current dialog state
 * Each dialog component is lazily rendered only when needed
 */
const DialogContainer = () => {
  const { state } = useDialog();
  
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
