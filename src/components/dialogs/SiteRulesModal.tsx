
import React from 'react';
import { Button } from '@/components/ui/button';
import { Overlay } from '@/components/ui/overlay';
import { useModal } from '@/context/ModalContext';

const SiteRulesModal: React.FC = () => {
  const { state, closeModal } = useModal();
  
  const isOpen = state.isOpen && state.type === 'siteRules';
  
  return (
    <Overlay
      id="site-rules-modal"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto z-50 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Community Guidelines</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Respect Other Users</h3>
            <p>Treat all members of our community with respect. Harassment, hate speech, and bullying are not tolerated.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Protect Privacy</h3>
            <p>Do not share personal information about yourself or others. This includes addresses, phone numbers, and financial details.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Keep Content Appropriate</h3>
            <p>Do not post explicit, violent, or otherwise inappropriate content. This is a safe space for everyone.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">No Spam or Scams</h3>
            <p>Do not use our platform to send spam messages or attempt to scam others.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Age Requirements</h3>
            <p>Users must be 18 years or older to use this service. Report any suspected underage users immediately.</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={closeModal}>I Understand</Button>
        </div>
      </div>
    </Overlay>
  );
};

export default SiteRulesModal;
