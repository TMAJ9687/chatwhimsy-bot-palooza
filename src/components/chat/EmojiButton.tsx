
import React from 'react';
import { Smile } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from './EmojiPicker';

interface EmojiButtonProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

const EmojiButton: React.FC<EmojiButtonProps> = ({ onEmojiSelect, disabled = false }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
          disabled={disabled}
          title="Add emoji"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <EmojiPicker onEmojiSelect={onEmojiSelect} useBasicPicker={false} />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiButton;
