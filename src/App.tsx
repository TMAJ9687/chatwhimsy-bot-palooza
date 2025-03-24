
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
import { useEffect, useState } from "react";
import { DialogProvider } from "./context/DialogContext";
import DialogContainer from "./components/dialogs/DialogContainer";
import { UserProvider } from "./context/UserContext";

const queryClient = new QueryClient();

const App = () => {
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Handle logout action
  const handleLogout = () => {
    setHasLoggedOut(true);
    // Add a brief delay before navigating to ensure state updates
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // Reset logout state when returning to the app
  useEffect(() => {
    if (hasLoggedOut && window.location.pathname === '/') {
      setHasLoggedOut(false);
    }
  }, [hasLoggedOut]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <DialogProvider>
            <Toaster />
            <Sonner />
            <MainLayout>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/chat" element={<ChatInterface onLogout={handleLogout} />} />
                  <Route path="/vip-profile" element={<VipProfileSetup />} />
                  <Route path="/vip-signup" element={<VipSignup />} />
                  <Route path="/vip-login" element={<VipLogin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <DialogContainer />
            </MainLayout>
          </DialogProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
