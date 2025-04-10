
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
      cancelAnimationFrame(frameId);
      setMounted(false);
    };
  }, []);
  
  // Check if container exists in document before creating portal
  const isContainerValid = container && document.contains(container);
  
  // Only render if we're mounted and container exists and is valid
  if (!mounted || !isContainerValid) {
    return null;
  }
  
  return createPortal(children, container as HTMLElement);
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
      
      // Only remove if we're still in a valid document context
      if (typeof document !== 'undefined' && document.body) {
        const portalElement = document.getElementById('portal-root');
        if (portalElement && document.body.contains(portalElement)) {
          try {
            document.body.removeChild(portalElement);
          } catch (error) {
            console.warn('Error removing portal root:', error);
          }
        }
      }
      
      portalRootRef.current = null;
    };
  }, []);
  
  return null;
};

export default PortalManager;
