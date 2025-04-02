
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

// Portal component that safely renders content to a specified DOM element
export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  return mounted && container ? createPortal(children, container) : null;
};

// PortalManager that creates a dedicated element for portals
const PortalManager: React.FC = () => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Look for existing portal container
    let container = document.getElementById('portal-root');
    
    // Create a new one if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = 'portal-root';
      document.body.appendChild(container);
    }
    
    setPortalRoot(container);
    
    // Clean up when component unmounts
    return () => {
      // Only remove the container if we created it and it's still in the document
      if (container && container.parentElement) {
        container.parentElement.removeChild(container);
      }
    };
  }, []);
  
  return null;
};

export default PortalManager;
