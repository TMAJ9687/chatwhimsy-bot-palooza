
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Overlay } from '@/components/ui/overlay';
import { useModal } from '@/context/ModalContext';
import { useLogout } from '@/hooks/useLogout';

interface ModalContentProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ModalContent: React.FC<ModalContentProps> = ({ onConfirm, onCancel, isLoading }) => (
  <div className="bg-white rounded-lg p-6 max-w-md mx-auto z-50">
    <h2 className="text-xl font-semibold mb-4">Sign Out</h2>
    <p className="mb-6">Are you sure you want to sign out?</p>
    
    <div className="flex justify-end space-x-2">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? 'Signing Out...' : 'Sign Out'}
      </Button>
    </div>
  </div>
);

const LogoutConfirmationModal: React.FC = () => {
  const { state, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const { performLogout } = useLogout();
  
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await performLogout();
      // Redirect is handled in the performLogout function
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
      closeModal();
    }
  }, [closeModal, performLogout]);
  
  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);
  
  const isOpen = state.isOpen && state.type === 'logout';
  
  return (
    <Overlay
      id="logout-modal"
      isOpen={isOpen}
      onClose={handleCancel}
    >
      <ModalContent
        onConfirm={handleLogout}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </Overlay>
  );
};

export default LogoutConfirmationModal;
