
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
import { useLocation } from 'react-router-dom';

// This component renders the appropriate dialog based on the current dialog state
const DialogContainer = () => {
  const { state } = useDialog();
  const location = useLocation();
  
  // Determine if we're on the chat page
  const isChatPage = location.pathname === '/chat';

  if (!state.isOpen) {
    return null;
  }

  // Only allow certain dialogs when not on chat page
  if (!isChatPage) {
    switch (state.type) {
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
      case 'siteRules':
        return <SiteRulesDialog />;
      case 'vipSelect':
        return <VipSelectDialog />;
      default:
        return null;
    }
  }

  // All dialogs available on chat page
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
    default:
      return null;
  }
};

export default DialogContainer;
