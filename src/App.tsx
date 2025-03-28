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
import { useEffect, useState } from "react";
import { DialogProvider } from "./context/DialogContext";
import DialogContainer from "./components/dialogs/DialogContainer";
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";
import NavigationLock from "./components/shared/NavigationLock";
import { AdminStatistics } from './components/admin/AdminStatistics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      structuralSharing: true,
      gcTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [userType, setUserType] = useState<'standard' | 'vip' | null>(null);

  useEffect(() => {
    initPerformanceMonitoring();
    
    const handleVisibilityChange = () => {
      performance.mark(`visibility_${document.visibilityState}`);
      console.info(`App visibility changed to: ${document.visibilityState}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    performance.mark('app_load_start');
    window.addEventListener('load', () => {
      performance.mark('app_load_end');
      performance.measure('App Load Time', 'app_load_start', 'app_load_end');
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogout = () => {
    const userData = localStorage.getItem('chatUser');
    let type: 'standard' | 'vip' | null = null;
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        type = user.isVip ? 'vip' : 'standard';
        setUserType(type);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    setHasLoggedOut(true);
    
    requestAnimationFrame(() => {
      if (type === 'standard') {
        window.location.href = '/feedback';
      } else {
        window.location.href = '/';
      }
    });
  };

  useEffect(() => {
    if (hasLoggedOut && window.location.pathname === '/') {
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
            <DialogProvider>
              <ChatProvider>
                <MainLayout>
                  <Toaster />
                  <Sonner />
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
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/admin-statistics" element={<AdminStatistics />} />
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
}

export default App;
