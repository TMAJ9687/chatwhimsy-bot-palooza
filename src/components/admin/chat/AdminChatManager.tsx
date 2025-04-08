
import React, { memo } from 'react';
import AdminChat from './AdminChat';
import { useAdminChatVisibility } from '@/hooks/admin/useAdminChatVisibility';

/**
 * Managing component for AdminChat that prevents unnecessary rerenders
 */
const AdminChatManager: React.FC = () => {
  const { isVisible } = useAdminChatVisibility();
  
  // Don't render if visibility is explicitly disabled
  if (isVisible === false) return null;
  
  return <AdminChat />;
};

export default memo(AdminChatManager);
