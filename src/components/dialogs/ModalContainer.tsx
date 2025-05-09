
import React, { Suspense, lazy } from 'react';
import { useModal } from '@/context/ModalContext';
import LogoutErrorBoundary from '@/components/error/LogoutErrorBoundary';

// Import frequently used modals directly
import SiteRulesModal from './SiteRulesModal';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import AlertModal from './AlertModal';
import VipSelectModal from './VipSelectModal';

// Simple loading fallback
const ModalFallback = () => (
  <div className="bg-white rounded-lg p-4 shadow-lg animate-pulse">
    <div className="h-6 w-32 bg-gray-200 mb-4 rounded"></div>
    <div className="h-4 w-64 bg-gray-200 mb-2 rounded"></div>
    <div className="h-4 w-48 bg-gray-200 rounded"></div>
  </div>
);

// Lazy load other modals
const ReportModal = lazy(() => import('./ReportModal'));
const BlockUserModal = lazy(() => import('./BlockUserModal'));
const VipLoginModal = lazy(() => import('./VipLoginModal'));
const VipSignupModal = lazy(() => import('./VipSignupModal'));
const VipSubscriptionModal = lazy(() => import('./VipSubscriptionModal'));
const VipPaymentModal = lazy(() => import('./VipPaymentModal'));
const VipConfirmationModal = lazy(() => import('./VipConfirmationModal'));
const AccountDeletionModal = lazy(() => import('./AccountDeletionModal'));
const ConfirmModal = lazy(() => import('./ConfirmModal'));

const ModalContainer: React.FC = () => {
  const { state } = useModal();
  
  if (!state.isOpen) {
    return null;
  }

  // Render critical modals without Suspense
  if (state.type === 'siteRules') {
    return <SiteRulesModal />;
  }
  
  // Wrap logout modal with our error boundary
  if (state.type === 'logout') {
    return (
      <LogoutErrorBoundary>
        <LogoutConfirmationModal />
      </LogoutErrorBoundary>
    );
  }
  
  if (state.type === 'alert') {
    return <AlertModal />;
  }
  
  if (state.type === 'vipSelect') {
    return <VipSelectModal />;
  }

  return (
    <Suspense fallback={<ModalFallback />}>
      {(() => {
        switch (state.type) {
          case 'report':
            return <ReportModal />;
          case 'block':
            return <BlockUserModal />;
          case 'vipLogin':
            return <VipLoginModal />;
          case 'vipSignup':
            return <VipSignupModal />;
          case 'vipSubscription':
            return <VipSubscriptionModal />;
          case 'vipPayment':
            return <VipPaymentModal />;
          case 'vipConfirmation':
            return <VipConfirmationModal />;
          case 'accountDeletion':
            return <AccountDeletionModal />;
          case 'confirm':
            return <ConfirmModal />;
          default:
            return null;
        }
      })()}
    </Suspense>
  );
};

export default ModalContainer;
