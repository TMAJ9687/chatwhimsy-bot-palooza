
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Overlay } from '@/components/ui/overlay';
import { useModal } from '@/context/ModalContext';
import { useToast } from "@/hooks/use-toast";

const BlockUserModal: React.FC = () => {
  const { state, closeModal } = useModal();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get userName from modal data
  const { userName, userId, onBlock } = state.data || {};
  
  const handleBlock = () => {
    setIsSubmitting(true);
    
    // Log the block action
    console.log('Blocking user:', {
      user: userName,
      id: userId
    });
    
    // Call the onBlock callback if provided
    if (typeof onBlock === 'function') {
      onBlock(userId);
    }
    
    // Show success toast
    toast({
      title: "User Blocked",
      description: `${userName} has been blocked. You won't receive messages from them anymore.`,
    });
    
    // Close modal
    closeModal();
  };
  
  const handleCancel = () => {
    closeModal();
  };
  
  const isOpen = state.isOpen && state.type === 'block';
  
  if (!isOpen) return null;
  
  return (
    <Overlay
      id="block-user-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto z-50">
        <h2 className="text-xl font-semibold mb-2">Block User</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to block {userName}? You won't receive messages from them anymore.
        </p>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBlock}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Blocking..." : "Block User"}
          </Button>
        </div>
      </div>
    </Overlay>
  );
};

export default BlockUserModal;
