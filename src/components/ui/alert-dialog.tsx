
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useSafeDOMOperations } from "@/hooks/useSafeDOMOperations"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  // Track this instance for safer cleanup
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const { safeRemoveElement, registerNode } = useSafeDOMOperations();
  
  // Connect the forwarded ref with our local ref
  React.useImperativeHandle(ref, () => {
    return overlayRef.current as HTMLDivElement;
  }, [overlayRef.current]);
  
  // Register the overlay element when it's created
  React.useEffect(() => {
    if (overlayRef.current) {
      registerNode(overlayRef.current);
    }
  }, [registerNode]);
  
  // Clean up this overlay on unmount
  React.useEffect(() => {
    return () => {
      if (overlayRef.current) {
        // Use setTimeout to ensure proper timing in the cleanup sequence
        setTimeout(() => {
          safeRemoveElement(overlayRef.current);
        }, 50);
      }
    };
  }, [safeRemoveElement]);

  return (
    <AlertDialogPrimitive.Overlay
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
})
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => {
  // Use safe DOM operations
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const { cleanupOverlays, registerNode } = useSafeDOMOperations();
  
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
  
  // Clean up on unmount with enhanced timing
  React.useEffect(() => {
    return () => {
      // Use queueMicrotask for more reliable timing
      queueMicrotask(() => {
        // Safe body cleanup
        if (document.body) {
          document.body.style.overflow = 'auto';
        }
        
        // Additional overlay cleanup with delay to avoid race conditions
        setTimeout(() => {
          cleanupOverlays();
        }, 100);
      });
    };
  }, [cleanupOverlays]);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={contentRef}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        onCloseAutoFocus={(e) => {
          // Prevent focus issues that might lead to DOM problems
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Ensure dialog closed state is properly handled with props
          if (props.onEscapeKeyDown) {
            props.onEscapeKeyDown(e);
          }
        }}
        {...props}
      />
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
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
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
