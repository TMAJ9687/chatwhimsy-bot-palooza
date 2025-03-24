
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import SessionManager from './components/shared/SessionManager';
import { Toaster } from './components/ui/toaster';

// Import your pages
import HomePage from './pages/Home';
import ChatPage from './pages/Chat';
import VipProfileSetup from './pages/VipProfileSetup';
import VipLogin from './pages/VipLogin';
import VipSignup from './pages/VipSignup';

function App() {
  return (
    <UserProvider>
      <SessionManager>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/vip-profile" element={<VipProfileSetup />} />
          <Route path="/vip-login" element={<VipLogin />} />
          <Route path="/vip-signup" element={<VipSignup />} />
        </Routes>
        <Toaster />
      </SessionManager>
    </UserProvider>
  );
}

export default App;
