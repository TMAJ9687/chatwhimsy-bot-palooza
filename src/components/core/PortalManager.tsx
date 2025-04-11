
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

// Portal component that safely renders content to a specified DOM element
export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(true);
  const portalNodeRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Set mounted ref
    mountedRef.current = true;
    
    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      if (mountedRef.current) {
        setMounted(true);
      }
    });
    
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frameId);
      setMounted(false);
      
      // Ensure the portal content is removed from DOM when component is unmounted
      try {
        if (portalNodeRef.current && portalNodeRef.current.childNodes.length > 0) {
          while (portalNodeRef.current.firstChild) {
            portalNodeRef.current.removeChild(portalNodeRef.current.firstChild);
          }
        }
      } catch (error) {
        console.warn('[Portal] Error cleaning up portal:', error);
      }
    };
  }, []);
  
  useEffect(() => {
    // Store reference to container
    if (container) {
      portalNodeRef.current = container;
    }
  }, [container]);
  
  // Only render if we're mounted and container exists
  if (!mounted || !container) {
    return null;
  }
  
  return createPortal(children, container);
};

// PortalManager that creates a dedicated element for portals
const PortalManager: React.FC = () => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    // Avoid duplicate initialization
    if (initializedRef.current) return;
    initializedRef.current = true;
    
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
    
    // Store references
    setPortalRoot(container);
    
    // Clean up when component unmounts
    return () => {
      // Don't attempt cleanup if we're not initialized
      if (!initializedRef.current) return;
      initializedRef.current = false;
      
      // Only attempt removal if document is available
      if (typeof document !== 'undefined' && document.body) {
        try {
          const element = document.getElementById('portal-root');
          if (element) {
            // First, clear all children to avoid React trying to unmount them later
            while (element.firstChild) {
              element.removeChild(element.firstChild);
            }
            
            // Then remove the container itself
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          }
        } catch (error) {
          console.warn('Error removing portal root:', error);
        }
      }
    };
  }, []);
  
  return null;
};

export default PortalManager;
