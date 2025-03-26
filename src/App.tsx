
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './components/landing/LandingPage';
import ChatInterface from './components/chat/ChatInterface';
import VipProfileSetup from './pages/VipProfileSetup';
import VipSubscription from './pages/VipSubscription';
import VipPayment from './pages/VipPayment';
import VipConfirmation from './pages/VipConfirmation';
import VipSignup from './pages/VipSignup';
import VipLogin from './pages/VipLogin';
import NotFound from './pages/NotFound';
import DialogContainer from './components/dialogs/DialogContainer';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/shared/ThemeProvider';
import { UserProvider } from './context/UserContext';
import { DialogProvider } from './context/DialogContext';
import { AuthProvider } from './context/FirebaseAuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { useAuth } from './context/FirebaseAuthContext';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <UserProvider>
          <DialogProvider>
            <Router>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <ChatInterface onLogout={() => {}} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/vip-profile" 
                    element={
                      <ProtectedRoute requireVip={true}>
                        <VipProfileSetup />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/vip-subscription" element={<VipSubscription />} />
                  <Route 
                    path="/vip-payment" 
                    element={
                      <ProtectedRoute>
                        <VipPayment />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/vip-confirmation" element={<VipConfirmation />} />
                  <Route path="/vip-signup" element={<VipSignup />} />
                  <Route path="/vip-login" element={<VipLogin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
              <DialogContainer />
              <Toaster />
            </Router>
          </DialogProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
