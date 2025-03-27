
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button 
      size="icon"
      onClick={onClick}
      className={`
        rounded-full 
        ${!disabled ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
      `}
      disabled={disabled}
    >
      <Send className="h-5 w-5" />
    </Button>
  );
};

export default SendButton;
