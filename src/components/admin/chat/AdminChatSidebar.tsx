
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface AdminChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Sidebar to display the admin chat interface
 */
const AdminChatSidebar: React.FC<AdminChatSidebarProps> = ({ isOpen, onClose, children }) => {
  // Use our custom hook to lock body scroll when sidebar is open
  useBodyScrollLock(isOpen);
  
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop - use React state for showing/hiding instead of direct DOM manipulation */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden transition-transform transform-gpu">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Admin Chat</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        {/* Content */}
        <div className="h-[calc(100%-60px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default AdminChatSidebar;
