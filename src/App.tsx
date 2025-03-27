
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
import { useEffect, useState } from "react";
import { DialogProvider } from "./context/DialogContext";
import DialogContainer from "./components/dialogs/DialogContainer";
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import { AdminProvider } from "./context/AdminContext";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";
import NavigationLock from "./components/shared/NavigationLock";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";

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
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle logout action with requestAnimationFrame for better performance
  const handleLogout = () => {
    setHasLoggedOut(true);
    // Use requestAnimationFrame for smoother UI
    requestAnimationFrame(() => {
      window.location.href = '/';
    });
  };

  // Reset logout state when returning to the app
  useEffect(() => {
    if (hasLoggedOut && window.location.pathname === '/') {
      // Delay state update for better performance
      const timer = setTimeout(() => {
        setHasLoggedOut(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoggedOut]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <UserProvider>
            <AdminProvider>
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
                      
                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/dashboard" element={
                        <ProtectedAdminRoute>
                          <AdminDashboard />
                        </ProtectedAdminRoute>
                      } />
                      <Route path="/admin/users" element={
                        <ProtectedAdminRoute>
                          <UserManagement />
                        </ProtectedAdminRoute>
                      } />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <DialogContainer />
                  </MainLayout>
                </ChatProvider>
              </DialogProvider>
            </AdminProvider>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
