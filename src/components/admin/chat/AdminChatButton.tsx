
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface AdminChatButtonProps {
  onClick: () => void;
}

/**
 * Button to open the admin chat interface
 */
const AdminChatButton: React.FC<AdminChatButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="h-14 w-14 rounded-full shadow-lg"
      size="icon"
    >
      <MessageCircle size={24} className="text-white" />
    </Button>
  );
};

export default AdminChatButton;
