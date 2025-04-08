
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { UserProvider } from '@/context/UserContext';
import { DialogProvider } from '@/context/DialogContext';
import ChatPage from '@/pages/ChatPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import VipProfilePage from '@/pages/VipProfilePage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import RequireAuth from '@/components/auth/RequireAuth';
import RequireAdminAuth from '@/components/auth/RequireAdminAuth';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ReconnectPage from '@/pages/ReconnectPage';
import FeedbackPage from '@/pages/FeedbackPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <UserProvider>
        <DialogProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/secretadminportal" element={<AdminLogin />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            } />
            <Route path="/profile" element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            } />
            <Route path="/vip-profile" element={
              <RequireAuth>
                <VipProfilePage />
              </RequireAuth>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <RequireAdminAuth>
                <AdminDashboard />
              </RequireAdminAuth>
            } />
            
            {/* Session management routes */}
            <Route path="/reconnect" element={<ReconnectPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster />
        </DialogProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
