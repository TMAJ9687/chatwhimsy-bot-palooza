
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
import { useChat } from '@/context/ChatContext';

const DialogContainer = () => {
  const { currentBot, userChats } = useChat();
  
  // Get messages for the current bot
  const currentMessages = currentBot && currentBot.id ? userChats[currentBot.id] || [] : [];
  const contactName = currentBot?.name || 'Contact';

  return (
    <>
      <AccountDeletionDialog />
      <VipLoginDialog />
      <VipSignupDialog />
      <VipPaymentDialog />
      <VipConfirmationDialog />
      <SharedMediaDialog messages={currentMessages} contactName={contactName} />
      <ConfirmationDialog />
      <DeleteConversationDialog />
      <VipSelectDialog />
    </>
  );
};

export default DialogContainer;
