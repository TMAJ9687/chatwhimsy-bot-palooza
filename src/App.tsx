
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ChatInterface from './components/chat/ChatInterface';
import VipProfileSetup from './pages/VipProfileSetup';
import VipSignup from './pages/VipSignup';
import VipLogin from './pages/VipLogin';
import VipSubscription from './pages/VipSubscription';
import VipPayment from './pages/VipPayment';
import VipConfirmation from './pages/VipConfirmation';
import Feedback from './pages/Feedback';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { OverlayProvider } from './context/OverlayContext';
import { ModalProvider } from './context/ModalContext';
import ModalContainer from './components/dialogs/ModalContainer';
import PortalManager from './components/core/PortalManager';
import { ChatProvider } from './context/ChatContext';
import NavigationLock from './components/shared/NavigationLock';
import AuthListener from './components/core/AuthListener';
import { UserProvider } from './context/UserContext';
import { UIStateProvider } from './context/UIStateContext';
import { DialogProvider } from './components/providers/DialogProvider';
import DialogContainer from './components/dialogs/DialogContainer';
import ErrorHandler from './components/core/ErrorHandler';

// Create QueryClient with proper configuration to reduce re-renders
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
  const handleLogout = React.useCallback(() => {
    // This will now be handled by the ModalContext
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <UserProvider>
            <UIStateProvider>
              <DialogProvider>
                <OverlayProvider>
                  <ModalProvider>
                    <ChatProvider>
                      <PortalManager />
                      <MainLayout>
                        <Toaster />
                        <Sonner />
                        <NavigationLock />
                        <AuthListener />
                        <ErrorHandler />
                        
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
                        
                        <ModalContainer />
                        <DialogContainer />
                      </MainLayout>
                    </ChatProvider>
                  </ModalProvider>
                </OverlayProvider>
              </DialogProvider>
            </UIStateProvider>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
