
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatInterface from "./components/chat/ChatInterface";
import VipProfileSetup from "./pages/VipProfileSetup";
import VipSignup from "./pages/VipSignup";
import VipLogin from "./pages/VipLogin";
import VipSubscription from "./pages/VipSubscription";
import VipPayment from "./pages/VipPayment";
import VipConfirmation from "./pages/VipConfirmation";
import Feedback from "./pages/Feedback";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect, useState, useCallback, useRef } from "react";
import { DialogProvider } from "./context/DialogContext";
import DialogContainer from "./components/dialogs/DialogContainer";
import { ChatProvider } from "./context/ChatContext";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";
import NavigationLock from "./components/shared/NavigationLock";
import { toast } from "@/hooks/use-toast";

// Configure React Query for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      // Improve performance with structural sharing
      structuralSharing: true,
      // Add caching for better performance
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [userType, setUserType] = useState<'standard' | 'vip' | null>(null);
  const logoutInProgressRef = useRef(false);
  const errorHandlerSetRef = useRef(false);

  // Initialize performance monitoring with more detailed options
  useEffect(() => {
    initPerformanceMonitoring();
    
    // Log when app becomes visible/hidden (potential freeze point)
    const handleVisibilityChange = () => {
      performance.mark(`visibility_${document.visibilityState}`);
      console.info(`App visibility changed to: ${document.visibilityState}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track initial load performance
    performance.mark('app_load_start');
    window.addEventListener('load', () => {
      performance.mark('app_load_end');
      performance.measure('App Load Time', 'app_load_start', 'app_load_end');
    });
    
    // Only add error handler once (prevents duplicate handlers)
    if (!errorHandlerSetRef.current) {
      errorHandlerSetRef.current = true;
      
      // Global error handler for removeChild errors
      const handleError = (event: ErrorEvent) => {
        if (
          event.message && 
          event.message.includes('removeChild') && 
          event.message.includes('not a child')
        ) {
          // Prevent default behavior
          event.preventDefault();
          console.warn('Caught removeChild error during navigation, suppressing');
          
          // Clean up DOM state
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          
          // If we're in the middle of logout, continue the process
          if (logoutInProgressRef.current) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          }
          
          // Clean up problematic elements
          try {
            document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
              .forEach(el => {
                try {
                  if (el.parentNode) {
                    // Check if it's truly a child first
                    const isChild = Array.from(el.parentNode.childNodes).includes(el);
                    if (isChild) {
                      el.remove();
                    }
                  }
                } catch (e) {
                  // Ignore removal errors
                }
              });
          } catch (e) {
            // Ignore cleanup errors
          }
          
          return false;
        }
      };
      
      window.addEventListener('error', handleError, { capture: true });
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle logout action
  const handleLogout = useCallback(() => {
    // Set logout in progress flag
    logoutInProgressRef.current = true;
    
    // Set hasLoggedOut state
    setHasLoggedOut(true);
    
    // Navigation will be handled by the LogoutConfirmationDialog
  }, []);

  // Reset logout state when returning to the app
  useEffect(() => {
    if (hasLoggedOut && window.location.pathname === '/') {
      // Delay state update for better performance
      const timer = setTimeout(() => {
        setHasLoggedOut(false);
        logoutInProgressRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoggedOut]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <DialogProvider>
            <ChatProvider>
              <MainLayout>
                <Toaster />
                <Sonner />
                {/* Add the NavigationLock component to help with navigation */}
                <NavigationLock />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/chat" element={<ChatInterface onLogout={handleLogout} />} />
                  <Route path="/vip-profile" element={<VipProfileSetup />} />
                  <Route path="/vip-signup" element={<VipSignup />} />
                  <Route path="/vip-login" element={<VipLogin />} />
                  <Route path="/vip-subscription" element={<VipSubscription />} />
                  <Route path="/vip-payment" element={<VipPayment />} />
                  <Route path="/vip-confirmation" element={<VipConfirmation />} />
                  <Route path="/feedback" element={<Feedback />} />
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <DialogContainer />
              </MainLayout>
            </ChatProvider>
          </DialogProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
