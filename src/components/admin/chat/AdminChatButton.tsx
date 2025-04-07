
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminChatButtonProps {
  onClick: () => void;
}

const AdminChatButton: React.FC<AdminChatButtonProps> = ({ onClick }) => {
  return (
    <Button 
      onClick={onClick}
      className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
    >
      <MessageCircle className="h-5 w-5" />
      <span>Open Chat</span>
    </Button>
  );
};

export default AdminChatButton;
