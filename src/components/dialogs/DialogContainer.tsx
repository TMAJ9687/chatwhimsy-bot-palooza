
import React from 'react';
import AccountDeletionDialog from './AccountDeletionDialog';
import VipLoginDialog from './VipLoginDialog';
import VipSignupDialog from './VipSignupDialog';
import VipPaymentDialog from './VipPaymentDialog';
import VipConfirmationDialog from './VipConfirmationDialog';
import SharedMediaDialog from '../chat/SharedMediaDialog';
import ConfirmationDialog from './ConfirmationDialog';
import DeleteConversationDialog from './DeleteConversationDialog';
import VipSelectDialog from './VipSelectDialog';
// Import other dialogs as needed

const DialogContainer = () => {
  return (
    <>
      <AccountDeletionDialog />
      <VipLoginDialog />
      <VipSignupDialog />
      <VipPaymentDialog />
      <VipConfirmationDialog />
      <SharedMediaDialog messages={[]} contactName="Contact" />
      <ConfirmationDialog />
      <DeleteConversationDialog />
      <VipSelectDialog />
    </>
  );
};

export default DialogContainer;
