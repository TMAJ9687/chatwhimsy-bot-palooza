
import React from 'react';
import { useDialog } from '@/context/DialogContext';
import AlertDialog from '@/components/dialogs/AlertDialog';
import LogoutConfirmationDialog from '@/components/dialogs/LogoutConfirmationDialog';
import ReportDialog from '@/components/dialogs/ReportDialog';
import BlockUserDialog from '@/components/dialogs/BlockUserDialog';
import SiteRulesDialog from '@/components/dialogs/SiteRulesDialog';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog';
import AccountDeletionDialog from '@/components/dialogs/AccountDeletionDialog';
import VipLoginDialog from '@/components/dialogs/VipLoginDialog';
import VipSignupDialog from '@/components/dialogs/VipSignupDialog';
import VipSubscriptionDialog from '@/components/dialogs/VipSubscriptionDialog';
import VipPaymentDialog from '@/components/dialogs/VipPaymentDialog';
import VipConfirmationDialog from '@/components/dialogs/VipConfirmationDialog';
import VipSelectDialog from '@/components/dialogs/VipSelectDialog';

const DialogManager: React.FC = () => {
  const { state } = useDialog();
  
  // If no dialog is open, render nothing
  if (!state.isOpen) return null;
  
  // Return the appropriate dialog based on the dialog type
  switch(state.type) {
    case 'alert':
      return <AlertDialog />;
    case 'logout':
      return <LogoutConfirmationDialog />;
    case 'report':
      return <ReportDialog />;
    case 'block':
      return <BlockUserDialog />;
    case 'siteRules':
      return <SiteRulesDialog />;
    case 'confirm':
      return <ConfirmDialog />;
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
};

export default DialogManager;
