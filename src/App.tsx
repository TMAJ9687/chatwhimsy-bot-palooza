import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";
import NavigationLock from "./components/shared/NavigationLock";
import { toast } from "@/hooks/use-toast";
import { useLogout } from "@/hooks/useLogout";

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
    
    // Error handler for removeChild errors that bubble up
    const handleError = (event: ErrorEvent) => {
      if (
        event.message && 
        event.message.includes('removeChild') && 
        event.message.includes('not a child')
      ) {
        // Prevent default behavior
        event.preventDefault();
        console.warn('Caught removeChild error during navigation, suppressing');
        
        // If we're in the middle of logout, continue the process
        if (logoutInProgressRef.current) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        }
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Handle logout action with the new reusable hook
  const { performLogout } = useLogout();
  
  const handleLogout = useCallback(() => {
    // Set logout in progress flag
    logoutInProgressRef.current = true;
    
    // Perform the logout
    performLogout(() => {
      // This callback runs after user state is cleared but before navigation
      setHasLoggedOut(true);
    });
  }, [performLogout]);

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
          <UserProvider>
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
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
