
import React from 'react';
import { Button } from '@/components/ui/button';
import { Overlay } from '@/components/ui/overlay';
import { useModal } from '@/context/ModalContext';

const AlertModal: React.FC = () => {
  const { state, closeModal } = useModal();
  
  const isOpen = state.isOpen && state.type === 'alert';
  const { title, message } = state.data;
  
  return (
    <Overlay
      id="alert-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto z-50">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="mb-6">{message}</p>
        
        <div className="flex justify-end">
          <Button onClick={closeModal}>OK</Button>
        </div>
      </div>
    </Overlay>
  );
};

export default AlertModal;
