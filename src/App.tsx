import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { UIProvider } from '@/context/UIContext';
import DialogManager from '@/components/ui/dialog-system/DialogManager';

// Import your pages here
import HomePage from '@/pages/HomePage';
import ChatPage from '@/pages/ChatPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AccountSettings from '@/pages/AccountSettings';
import FeedbackPage from '@/pages/FeedbackPage';
import PricingPage from '@/pages/PricingPage';
import NotFoundPage from '@/pages/NotFoundPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';

function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/secretadminportal" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <DialogManager />
          <Toaster />
        </Router>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
