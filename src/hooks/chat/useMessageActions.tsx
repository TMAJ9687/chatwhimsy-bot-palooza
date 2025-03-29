import { useCallback } from 'react';
import { Message, Translation } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useMessageActions = (
  isVip: boolean,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  setReplyingToMessage: React.Dispatch<React.SetStateAction<Message | null>>,
  handleSendTextMessageWrapper: (text: string) => string
) => {
  const { toast } = useToast();

  // Translate message handler - VIP only
  const handleTranslateMessage = useCallback((messageId: string, targetLanguage: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Message translation is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    const translateText = (text: string, language: string): string => {
      const mockTranslations: Record<string, Record<string, string>> = {
        en: {
          "Hello!": "Hello!",
          "How are you?": "How are you?",
          "I'm good": "I'm good",
        },
        es: {
          "Hello!": "¡Hola!",
          "How are you?": "¿Cómo estás?",
          "I'm good": "Estoy bien",
        },
        fr: {
          "Hello!": "Bonjour!",
          "How are you?": "Comment ça va?",
          "I'm good": "Je vais bien",
        },
        de: {
          "Hello!": "Hallo!",
          "How are you?": "Wie geht es dir?",
          "I'm good": "Mir geht es gut",
        }
      };
      
      if (mockTranslations[language] && mockTranslations[language][text]) {
        return mockTranslations[language][text];
      }
      
      return `[${language.toUpperCase()}] ${text}`;
    };
    
    setUserChats(prev => {
      const newChats = { ...prev };
      let translatedMessage = false;
      
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId) {
            if (msg.isImage || msg.isVoice) return msg;
            
            translatedMessage = true;
            const newTranslation: Translation = {
              language: targetLanguage,
              content: translateText(msg.content, targetLanguage)
            };
            
            return {
              ...msg,
              translations: [newTranslation]
            };
          }
          return msg;
        });
      });
      
      return newChats;
    });
    
    toast({
      title: "Message translated",
      description: `Message has been translated to ${targetLanguage.toUpperCase()}.`,
      duration: 3000
    });
  }, [setUserChats, toast, isVip]);

  // Reply to message handler - VIP only
  const handleReplyToMessage = useCallback((messageId: string, content: string, userChats: Record<string, Message[]>) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Replying to messages is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    // Find the message to reply to across all chats
    let messageToReplyTo: Message | null = null;
    
    Object.keys(userChats).forEach(botId => {
      const foundMessage = userChats[botId].find(msg => msg.id === messageId);
      if (foundMessage) {
        messageToReplyTo = foundMessage;
      }
    });
    
    if (!messageToReplyTo) return;
    
    // Set the message we're replying to
    setReplyingToMessage(messageToReplyTo);
    
    // If content is provided, immediately send the reply
    if (content) {
      return handleSendTextMessageWrapper(content);
    }
  }, [isVip, setReplyingToMessage, handleSendTextMessageWrapper, toast]);

  // React to message handler - VIP only
  const handleReactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Reacting to messages is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    setUserChats(prev => {
      const newChats = { ...prev };
      let updated = false;
      
      // Look for the message across all chats
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId) {
            updated = true;
            // Create a new array of reactions to avoid mutating the original
            const existingReactions = [...(msg.reactions || [])];
            
            // Check if this emoji is already used by the user
            const existingReactionIndex = existingReactions.findIndex(
              r => r.userId === 'user' && r.emoji === emoji
            );
            
            let newReactions;
            
            // If the emoji is already used, remove it (toggle behavior)
            if (existingReactionIndex >= 0) {
              newReactions = [
                ...existingReactions.slice(0, existingReactionIndex),
                ...existingReactions.slice(existingReactionIndex + 1)
              ];
            } else {
              // Otherwise, add the new reaction
              newReactions = [...existingReactions, { emoji, userId: 'user' }];
            }
            
            // Return a new message object with the updated reactions
            return {
              ...msg,
              reactions: newReactions
            };
          }
          return msg;
        });
      });
      
      // Only show the toast if we actually updated a message
      if (updated) {
        toast({
          title: "Reaction updated",
          description: `You reacted with ${emoji}`,
          duration: 2000
        });
      }
      
      return newChats;
    });
  }, [isVip, setUserChats, toast]);

  // Unsend message handler - VIP only
  const handleUnsendMessage = useCallback((messageId: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Unsending messages is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    setUserChats(prev => {
      const newChats = { ...prev };
      let messageFound = false;
      
      // Look for the message across all chats
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          // Only allow unsending user messages
          if (msg.id === messageId && msg.sender === 'user') {
            messageFound = true;
            // Mark the message as deleted by setting isDeleted to true
            return { ...msg, isDeleted: true };
          }
          return msg;
        });
      });
      
      // Only show toast if we found and unsent a message
      if (messageFound) {
        toast({
          title: "Message unsent",
          description: "Your message has been unsent",
          duration: 3000
        });
      }
      
      return newChats;
    });
  }, [isVip, setUserChats, toast]);

  return {
    handleTranslateMessage,
    handleReplyToMessage,
    handleReactToMessage,
    handleUnsendMessage
  };
};
