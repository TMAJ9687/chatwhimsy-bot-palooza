
import React from 'react';
import { Reply, Heart, Trash2 } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/chat';

interface MessageActionsProps {
  message: Message;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, reaction: string) => void;
  onUnsend?: (messageId: string) => void;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onReply,
  onReact,
  onUnsend
}) => {
  const canUnsend = message.sender === 'user';
  
  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };
  
  const handleReact = (reaction: string) => {
    if (onReact) {
      onReact(message.id, reaction);
    }
  };
  
  const handleUnsend = () => {
    if (onUnsend && canUnsend) {
      onUnsend(message.id);
    }
  };
  
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReply}>
        <Reply className="h-3.5 w-3.5 text-gray-500" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Heart className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 flex">
          {REACTIONS.map(reaction => (
            <button
              key={reaction}
              className="text-lg p-1 hover:scale-125 transition-transform"
              onClick={() => handleReact(reaction)}
            >
              {reaction}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      
      {canUnsend && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleUnsend}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default MessageActions;
