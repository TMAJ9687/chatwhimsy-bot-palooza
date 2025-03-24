
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

// Create a conditional import for the ChatContext
const DialogContainer = () => {
  // Define default values for when we're not in the chat context
  let currentMessages: any[] = [];
  let contactName = 'Contact';
  
  // Try to access ChatContext if available, but don't crash if it's not
  try {
    // We're wrapping this in try/catch because we might not be in a ChatProvider context
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { useChat } = require('@/context/ChatContext');
    try {
      const { currentBot, userChats } = useChat();
      // Only set these values if we successfully get the context
      currentMessages = currentBot && currentBot.id ? userChats[currentBot.id] || [] : [];
      contactName = currentBot?.name || 'Contact';
    } catch (e) {
      // We're not in a ChatProvider context - that's okay, we'll use the default values
      console.log('Not in ChatProvider context, using default values');
    }
  } catch (e) {
    // Module not available or other error
    console.log('Error accessing ChatContext, using default values');
  }

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
