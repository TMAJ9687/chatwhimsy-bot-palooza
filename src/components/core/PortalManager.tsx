
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
    // Set mounted ref in a more reliable way
    isMountedRef.current = true;
    
    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      if (isMountedRef.current) {
        setMounted(true);
      }
    });
    
    return () => {
      isMountedRef.current = false;
      setMounted(false);
      cancelAnimationFrame(frameId);
    };
  }, []);
  
  // Only render if we're mounted and container exists and is valid
  return (mounted && container && document.contains(container) && isMountedRef.current) 
    ? createPortal(children, container) 
    : null;
};

// PortalManager that creates a dedicated element for portals
const PortalManager: React.FC = () => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const portalRootRef = useRef<HTMLElement | null>(null);
  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    // Avoid duplicate initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Look for existing portal container
    let container = document.getElementById('portal-root');
    
    // Create a new one if it doesn't exist
    if (!container) {
      try {
        container = document.createElement('div');
        container.id = 'portal-root';
        
        // Ensure body exists before appending
        if (document.body) {
          document.body.appendChild(container);
        }
      } catch (error) {
        console.error('Error creating portal root:', error);
      }
    }
    
    // Store references safely
    portalRootRef.current = container;
    
    // Use state update inside requestAnimationFrame for better DOM sync
    requestAnimationFrame(() => {
      setPortalRoot(container);
    });
    
    // Clean up when component unmounts with better checks
    return () => {
      isInitializedRef.current = false;
      
      // Only remove the container if we created it and it's still valid
      if (container && 
          container.parentElement && 
          document.body && 
          document.body.contains(container)) {
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
