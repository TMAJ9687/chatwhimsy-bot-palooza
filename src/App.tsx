
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
import { useState, useCallback } from "react";
import { DialogProvider } from "./context/DialogContext";
import DialogContainer from "./components/dialogs/DialogContainer";
import { ChatProvider } from "./context/ChatContext";
import NavigationLock from "./components/shared/NavigationLock";
import AuthListener from "./components/core/AuthListener";
import ErrorHandler from "./components/core/ErrorHandler";
import PerformanceMonitor from "./components/core/PerformanceMonitor";
import useLogoutEffect from "./hooks/useLogoutEffect";
import { UserProvider } from "./context/UserContext";
import { UIStateProvider } from "./context/UIStateContext";

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

const App = () => {
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [userType] = useState<'standard' | 'vip' | null>(null);
  
  const { logoutInProgressRef } = useLogoutEffect(hasLoggedOut, setHasLoggedOut);

  const handleLogout = useCallback(() => {
    logoutInProgressRef.current = true;
    setHasLoggedOut(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <UIStateProvider>
            <DialogProvider>
              <ChatProvider>
                <UserProvider>
                  <MainLayout>
                    <Toaster />
                    <Sonner />
                    <NavigationLock />
                    <AuthListener />
                    <PerformanceMonitor />
                    <ErrorHandler logoutInProgressRef={logoutInProgressRef} />
                    
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
                      <Route path="/secretadminportal" element={<AdminLogin />} />
                      <Route path="/admin-dashboard" element={<AdminDashboard />} />
                      <Route path="/admin" element={<NotFound />} />
                      <Route path="/admin-login" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    
                    <DialogContainer />
                  </MainLayout>
                </UserProvider>
              </ChatProvider>
            </DialogProvider>
          </UIStateProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
