import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/context/UserContext';
import { ChatProvider } from '@/context/ChatContext';
import { ModalProvider } from '@/components/Modal';
import { DialogProvider } from '@/components/Dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainPage from '@/pages/MainPage';
import ChatPage from '@/pages/ChatPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import VIPPage from '@/pages/VIPPage';
import FAQPage from '@/pages/FAQPage';
import NotFound from '@/pages/NotFound';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import MainLayout from '@/layouts/MainLayout';
import useSupabaseAuthSync from '@/hooks/useSupabaseAuthSync';

const queryClient = new QueryClient();

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <ModalProvider>
                <DialogProvider>
                  <ChatProvider>
                    <UserProvider>
                      <MainLayout>
                        <Routes>
                          <Route path="/" element={<MainPage />} />
                          <Route path="/chat/:botId" element={<ChatPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/vip" element={<VIPPage />} />
                          <Route path="/faq" element={<FAQPage />} />
                          <Route path="/secretadminportal" element={<AdminLogin />} />
                          <Route path="/admin-dashboard" element={<AdminDashboard />} />
                          <Route path="/admin-dashboard/users" element={<AdminDashboard />} />
                          <Route path="/admin-dashboard/bots" element={<AdminDashboard />} />
                          <Route path="/admin-dashboard/reports" element={<AdminDashboard />} />
                          <Route path="/admin-dashboard/settings" element={<AdminDashboard />} />
                          <Route path="/admin-dashboard/moderation" element={<AdminDashboard />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </MainLayout>
                    </UserProvider>
                  </ChatProvider>
                </DialogProvider>
              </ModalProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
