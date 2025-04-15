
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

// Lazy load admin pages for better performance
const AdminDashboardWrapper = lazy(() => import('./pages/AdminDashboardWrapper'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Add lazy-loaded routes
const ChatPage = lazy(() => import('./pages/ChatPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const VipLogin = lazy(() => import('./pages/VipLogin'));
const VipSignup = lazy(() => import('./pages/VipSignup'));
const VipProfileSetup = lazy(() => import('./pages/VipProfileSetup'));
const VipPayment = lazy(() => import('./pages/VipPayment'));
const VipConfirmation = lazy(() => import('./pages/VipConfirmation'));
const VipSubscription = lazy(() => import('./pages/VipSubscription'));

const App = () => {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />

            {/* VIP routes */}
            <Route path="/vip-login" element={<VipLogin />} />
            <Route path="/vip-signup" element={<VipSignup />} />
            <Route path="/vip-profile" element={<VipProfileSetup />} />
            <Route path="/vip-payment" element={<VipPayment />} />
            <Route path="/vip-confirmation" element={<VipConfirmation />} />
            <Route path="/subscribe" element={<Navigate to="/subscribe/monthly" replace />} />
            <Route path="/subscribe/:plan" element={<VipSubscription />} />

            {/* Admin routes */}
            <Route path="/secretadminportal" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboardWrapper />} />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainLayout>
      <Toaster />
    </Router>
  );
};

export default App;
