
import React, { memo, useRef, useEffect } from 'react';
import AdminChat from './AdminChat';
import { useAdminChatVisibility } from '@/hooks/admin/useAdminChatVisibility';

/**
 * Managing component for AdminChat that prevents unnecessary rerenders
 * Enhanced with render tracking to prevent unnecessary init/cleanup cycles
 */
const AdminChatManager: React.FC = () => {
  const { isVisible } = useAdminChatVisibility();
  const wasVisible = useRef<boolean | null>(null);
  
  // Log once when visibility changes to track component lifecycle
  useEffect(() => {
    if (wasVisible.current !== isVisible) {
      wasVisible.current = isVisible;
    }
  }, [isVisible]);
  
  // Don't render if visibility is explicitly disabled
  if (isVisible === false) return null;
  
  return <AdminChat />;
};

// Use React.memo to prevent unnecessary re-renders
export default memo(AdminChatManager);
