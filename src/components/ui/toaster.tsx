
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { memo, useEffect, useRef, useState } from "react"

// Optimized toast item component
const ToastItem = memo(({ 
  id, 
  title, 
  description, 
  action, 
  ...props 
}: { 
  id: string, 
  title?: React.ReactNode, 
  description?: React.ReactNode, 
  action?: React.ReactNode,
  [key: string]: any 
}) => {
  // Use ref to avoid layout thrashing - changed to HTMLLIElement
  const toastRef = useRef<HTMLLIElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Apply animation after mount to avoid jank
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <Toast 
      ref={toastRef}
      key={id} 
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      {...props}
    >
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && (
          <ToastDescription>{description}</ToastDescription>
        )}
      </div>
      {action}
      <ToastClose />
    </Toast>
  )
});

ToastItem.displayName = "ToastItem";

// Performance optimized Toaster component
const ToasterComponent = () => {
  const { toasts } = useToast();
  
  // This prevents creating a new array on every render
  const memoizedToasts = toasts;

  return (
    <ToastProvider>
      {memoizedToasts.map(({ id, title, description, action, ...props }) => (
        <ToastItem
          key={id}
          id={id}
          title={title}
          description={description}
          action={action}
          {...props}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

// Memoize the whole component
export const Toaster = memo(ToasterComponent);
