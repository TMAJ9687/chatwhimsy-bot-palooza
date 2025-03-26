
import React, { useState } from 'react';
import { Reply, Trash2, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Message } from '@/types/chat';

interface MessageActionsProps {
  message: Message;
  isVip: boolean;
  onReply?: (message: Message) => void;
  onUnsend?: (messageId: string) => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  isVip,
  onReply,
  onUnsend
}) => {
  const [showReactions, setShowReactions] = useState(false);
  
  if (!isVip) return null;
  
  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };
  
  const handleUnsend = () => {
    if (onUnsend) {
      onUnsend(message.id);
    }
  };
  
  const handleReaction = (emoji: string) => {
    // In a real app, we would dispatch an action to add this reaction
    console.log(`Reacting with ${emoji} to message ${message.id}`);
    setShowReactions(false);
  };
  
  // Only user's messages can be unsent
  const canUnsend = message.sender === 'user';
  
  return (
    <div className="flex gap-1">
      {/* Reply button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleReply}
      >
        <Reply className="h-3.5 w-3.5 text-gray-500" />
      </Button>
      
      {/* Reactions popover */}
      <Popover open={showReactions} onOpenChange={setShowReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MessageSquareQuote className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-auto flex gap-1">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              className="text-lg hover:scale-125 transition-transform p-1"
              onClick={() => handleReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      
      {/* Unsend button (only for user's messages) */}
      {canUnsend && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
          onClick={handleUnsend}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default MessageActions;
