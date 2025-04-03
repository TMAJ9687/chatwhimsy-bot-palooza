
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

// Portal component that safely renders content to a specified DOM element
export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    setMounted(true);
    
    return () => {
      isMountedRef.current = false;
      setMounted(false);
    };
  }, []);
  
  // Only render if we're mounted and container exists
  return (mounted && container && isMountedRef.current) ? createPortal(children, container) : null;
};

// PortalManager that creates a dedicated element for portals
const PortalManager: React.FC = () => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const portalRootRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Look for existing portal container
    let container = document.getElementById('portal-root');
    
    // Create a new one if it doesn't exist
    if (!container) {
      try {
        container = document.createElement('div');
        container.id = 'portal-root';
        document.body.appendChild(container);
      } catch (error) {
        console.error('Error creating portal root:', error);
      }
    }
    
    // Store references
    portalRootRef.current = container;
    setPortalRoot(container);
    
    // Clean up when component unmounts
    return () => {
      // Only remove the container if we created it and it's still in the document
      if (container && container.parentElement && document.body.contains(container)) {
        try {
          document.body.removeChild(container);
        } catch (error) {
          console.warn('Error removing portal root:', error);
        }
      }
      
      portalRootRef.current = null;
    };
  }, []);
  
  return null;
};

export default PortalManager;
