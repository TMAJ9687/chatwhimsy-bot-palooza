
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/context/UserContext';
import { ChatProvider } from '@/context/ChatContext';
import { ModalProvider } from '@/components/Modal';
import { DialogProvider } from '@/components/Dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatInterface from '@/components/chat/ChatInterface';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import VIPPage from '@/pages/VIPPage';
import FAQPage from '@/pages/FAQPage';
import NotFound from '@/pages/NotFound';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import MainLayout from '@/layouts/MainLayout';
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import useSupabaseAuthSync from '@/hooks/useSupabaseAuthSync';

const queryClient = new QueryClient();

const App = () => {
  useSupabaseAuthSync();

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <ModalProvider>
                <DialogProvider>
                  <ChatProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/chat" element={
                        <MainLayout>
                          <ChatInterface onLogout={() => {}} />
                        </MainLayout>
                      } />
                      <Route path="/chat/:botId" element={<ChatPage />} />
                      <Route path="/profile" element={
                        <MainLayout>
                          <ProfilePage />
                        </MainLayout>
                      } />
                      <Route path="/settings" element={
                        <MainLayout>
                          <SettingsPage />
                        </MainLayout>
                      } />
                      <Route path="/vip" element={
                        <MainLayout>
                          <VIPPage />
                        </MainLayout>
                      } />
                      <Route path="/faq" element={
                        <MainLayout>
                          <FAQPage />
                        </MainLayout>
                      } />
                      <Route path="/secretadminportal" element={<AdminLogin />} />
                      <Route path="/admin-dashboard" element={<AdminDashboard />} />
                      <Route path="/admin-dashboard/users" element={<AdminDashboard />} />
                      <Route path="/admin-dashboard/bots" element={<AdminDashboard />} />
                      <Route path="/admin-dashboard/reports" element={<AdminDashboard />} />
                      <Route path="/admin-dashboard/settings" element={<AdminDashboard />} />
                      <Route path="/admin-dashboard/moderation" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
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
