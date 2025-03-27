
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

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
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Add enhanced cleanup on unmount with element existence checks
  const unmountedRef = React.useRef(false);
  const cleanupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Add a function to safely remove elements
  const safeRemoveElement = React.useCallback((element: Element) => {
    // Check if the element exists and has a parent
    if (element && element.parentNode && element.parentNode.contains(element)) {
      try {
        element.parentNode.removeChild(element);
      } catch (e) {
        // Log but don't crash if there's still an error
        console.warn('Error safely removing element:', e);
      }
    }
  }, []);
  
  React.useEffect(() => {
    return () => {
      // Mark component as unmounted
      unmountedRef.current = true;
      
      // Clear any existing timeout
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      try {
        // Use requestAnimationFrame to ensure we're not in the middle of a render cycle
        requestAnimationFrame(() => {
          // Don't proceed if document or body doesn't exist (SSR safety)
          if (!document || !document.body || unmountedRef.current === false) return;
          
          // Ensure body scroll is restored when drawer is closed
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden');
          
          // Add a short delay before trying to remove overlays
          cleanupTimeoutRef.current = setTimeout(() => {
            if (!document || unmountedRef.current === false) return;
            
            // Safely remove any orphaned drawer overlays
            const overlays = document.querySelectorAll('.vaul-overlay');
            overlays.forEach(safeRemoveElement);
            
            // Also look for any other potential overlay elements
            const otherOverlays = document.querySelectorAll('.fixed.inset-0.z-50');
            otherOverlays.forEach(safeRemoveElement);
          }, 100);
        });
      } catch (error) {
        console.warn('Error during drawer cleanup:', error);
      }
    };
  }, [safeRemoveElement]);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
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
