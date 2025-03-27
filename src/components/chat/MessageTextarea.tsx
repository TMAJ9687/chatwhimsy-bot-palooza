
import React from 'react';
import { MAX_CHAR_LIMIT, checkCharacterLimit, hasConsecutiveChars } from '@/utils/messageUtils';
import { useToast } from '@/hooks/use-toast';

interface MessageTextareaProps {
  message: string;
  onChange: (message: string) => void;
  onSubmit: () => void;
  isVip: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MessageTextarea: React.FC<MessageTextareaProps> = ({
  message,
  onChange,
  onSubmit,
  isVip,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const { toast } = useToast();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    if (!checkCharacterLimit(newText, isVip, true)) {
      onChange(newText.slice(0, MAX_CHAR_LIMIT));
      return;
    }
    
    if (newText.length > message.length && hasConsecutiveChars(newText)) {
      toast({
        title: "Pattern detected",
        description: "Please avoid sending more than 3 consecutive identical characters.",
        duration: 3000
      });
      return;
    }
    
    onChange(newText);
  };

  const isExceedingLimit = () => {
    return !isVip && message.length > MAX_CHAR_LIMIT;
  };

  return (
    <div className="flex-1 relative">
      <textarea
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "You can't message a blocked user" : placeholder}
        className={`w-full py-2 px-3 pr-16 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-left h-10 max-h-24 leading-normal ${isExceedingLimit() ? 'border-red-500 border' : ''}`}
        style={{paddingTop: '6px', paddingBottom: '6px'}}
        disabled={disabled}
      />
      {!isVip && (
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isExceedingLimit() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {message.length}/{MAX_CHAR_LIMIT}
        </div>
      )}
    </div>
  );
};

export default MessageTextarea;
