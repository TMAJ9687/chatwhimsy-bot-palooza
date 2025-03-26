
import React from 'react';
import { Check, Clock } from 'lucide-react';

interface MessageStatusProps {
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isUser: boolean;
  showStatus: boolean;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, isUser, showStatus }) => {
  if (!isUser || !showStatus) return null;
  
  switch (status) {
    case 'sending':
      return <Clock className="h-3 w-3 text-gray-400" />;
    case 'sent':
      return <Check className="h-3 w-3 text-gray-400" />;
    case 'delivered':
      return (
        <div className="flex -space-x-1">
          <Check className="h-3 w-3 text-gray-400" />
          <Check className="h-3 w-3 text-gray-400" />
        </div>
      );
    case 'read':
      return (
        <div className="flex -space-x-1 text-teal-500">
          <Check className="h-3 w-3" />
          <Check className="h-3 w-3" />
        </div>
      );
    default:
      return null;
  }
};

export default MessageStatus;
