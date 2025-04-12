
import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';

// Lazy load chat manager
const AdminChatManager = lazy(() => import('@/components/admin/chat/AdminChatManager'));

interface AdminChatOverlayProps {
  isVisible: boolean;
  toggleVisibility: () => void;
}

const AdminChatOverlay: React.FC<AdminChatOverlayProps> = ({ 
  isVisible, 
  toggleVisibility 
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 transition-transform duration-300 transform translate-y-0">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">Admin Chat</h2>
            <Button variant="outline" onClick={toggleVisibility}>Close Chat</Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AdminChatManager />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default AdminChatOverlay;
