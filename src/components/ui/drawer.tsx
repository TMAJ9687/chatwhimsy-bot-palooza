import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"
import { useSafeDOMOperations } from "@/hooks/useSafeDOMOperations"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  // Use safe DOM operations
  const { registerNode } = useSafeDOMOperations();
  
  // Keep track of the overlay element
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  
  // Connect our ref to the forwarded ref
  React.useImperativeHandle(ref, () => {
    return overlayRef.current as HTMLDivElement;
  }, [overlayRef.current]);
  
  // Register the overlay element when it's created
  React.useEffect(() => {
    if (overlayRef.current) {
      registerNode(overlayRef.current);
    }
  }, [registerNode]);
  
  return (
    <DrawerPrimitive.Overlay
      ref={overlayRef}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  );
})
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Add enhanced cleanup with element existence checks
  const unmountedRef = React.useRef(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const cleanupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Use our enhanced safe DOM operations hook
  const { safeRemoveElement, cleanupOverlays, registerNode } = useSafeDOMOperations();
  
  // Connect our ref to the forwarded ref
  React.useImperativeHandle(ref, () => {
    return contentRef.current as HTMLDivElement;
  }, [contentRef.current]);
  
  // Register the content element when it's created
  React.useEffect(() => {
    if (contentRef.current) {
      registerNode(contentRef.current);
    }
  }, [registerNode]);
  
  React.useEffect(() => {
    return () => {
      // Mark component as unmounted
      unmountedRef.current = true;
      
      // Clear any existing timeout
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      try {
        // Use queueMicrotask for more reliable timing than requestAnimationFrame
        queueMicrotask(() => {
          // Don't proceed if document or body doesn't exist (SSR safety)
          if (!document || !document.body || unmountedRef.current === false) return;
          
          // Ensure body scroll is restored when drawer is closed
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden');
          
          // Add a short delay before trying to remove overlays
          cleanupTimeoutRef.current = setTimeout(() => {
            if (!document || unmountedRef.current === false) return;
            
            // Use our safe overlay cleanup
            cleanupOverlays();
          }, 100);
        });
      } catch (error) {
        console.warn('Error during drawer cleanup:', error);
      }
    };
  }, [safeRemoveElement, cleanupOverlays]);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={contentRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
