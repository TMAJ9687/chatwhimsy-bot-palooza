
import React, { memo, useRef, useEffect } from 'react';
import { useAdminChatVisibility } from '@/hooks/admin/useAdminChatVisibility';

// Load AdminChat component only when needed using dynamic import
const AdminChat = React.lazy(() => import('./AdminChat'));

/**
 * Managing component for AdminChat that prevents unnecessary rerenders
 * Uses React.lazy for code splitting to improve initial load time
 */
const AdminChatManager: React.FC = () => {
  const { isVisible } = useAdminChatVisibility();
  const previousVisibility = useRef(isVisible);
  
  // Only log when visibility truly changes to avoid console spam
  useEffect(() => {
    if (previousVisibility.current !== isVisible) {
      previousVisibility.current = isVisible;
    }
  }, [isVisible]);
  
  // Don't render anything if visibility is explicitly disabled
  if (isVisible === false) return null;
  
  return (
    <React.Suspense fallback={null}>
      <AdminChat />
    </React.Suspense>
  );
};

// Use React.memo to prevent unnecessary re-renders with deep comparison
export default memo(AdminChatManager, (prevProps, nextProps) => {
  // Always return true since this component has no props
  return true;
});
