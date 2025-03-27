
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const unmountingRef = React.useRef(false);
  const cleanupAttemptTimeRef = React.useRef(0);
  const cleanupTimeoutsRef = React.useRef<number[]>([]);
  
  // Helper to safely remove element
  const safeRemoveElement = React.useCallback((element: Element) => {
    if (element && element.parentNode && element.parentNode.contains(element)) {
      try {
        // Double check parent relationship right before removal to prevent race conditions
        if (element.parentNode.contains(element)) {
          element.parentNode.removeChild(element);
        }
      } catch (error) {
        // Just log the error, don't throw - we want to continue with other cleanup
        console.warn('Safe element removal failed:', error);
      }
    }
  }, []);
  
  // Add improved cleanup effect with safety checks
  React.useEffect(() => {
    // Mark dialog as open
    const timeoutId = setTimeout(() => {
      if (document.body) {
        document.body.classList.add('dialog-open');
      }
    }, 0);
    
    cleanupTimeoutsRef.current.push(timeoutId as unknown as number);
    
    return () => {
      // Prevent concurrent cleanup operations
      const now = Date.now();
      if ((now - cleanupAttemptTimeRef.current) < 100) {
        return; // Skip if we just attempted cleanup
      }
      
      cleanupAttemptTimeRef.current = now;
      unmountingRef.current = true;
      
      // Clear all timeouts first
      cleanupTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      cleanupTimeoutsRef.current = [];
      
      // Clear the dialog marker timeout
      clearTimeout(timeoutId);
      
      try {
        // Use requestAnimationFrame to ensure DOM is ready for manipulation
        const rafId = requestAnimationFrame(() => {
          // Only cleanup if document exists (prevent errors in SSR or test environments)
          if (!document || !document.body) return;
          
          // Ensure body scroll is restored when dialog is closed
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open');
          
          // Queue cleanup in next animation frame to avoid race conditions
          requestAnimationFrame(() => {
            if (unmountingRef.current) {
              // Safely clean overlays with parent node checks
              try {
                // Target all possible dialog-related overlays
                const selectors = [
                  '[data-radix-dialog-overlay]',
                  '.fixed.inset-0.z-50.bg-black\\/80',
                  '.fixed.inset-0.z-50',
                  '.vaul-overlay'
                ];
                
                selectors.forEach(selector => {
                  document.querySelectorAll(selector).forEach(safeRemoveElement);
                });
              } catch (error) {
                console.warn('Error removing overlays:', error);
              }
            }
          });
        });
        
        // Store RAF ID for cleanup
        const cleanup = () => {
          try {
            cancelAnimationFrame(rafId);
          } catch (e) {
            // Ignore
          }
        };
        
        const timeoutId = setTimeout(cleanup, 500);
        cleanupTimeoutsRef.current.push(timeoutId as unknown as number);
      } catch (error) {
        console.warn('Error during dialog cleanup:', error);
      }
    };
  }, [safeRemoveElement]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        onCloseAutoFocus={(event) => {
          // Prevent focus issues that might cause DOM problems
          event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          // Ensure we don't get stuck dialogs
          if (props.onEscapeKeyDown) {
            props.onEscapeKeyDown(event);
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
