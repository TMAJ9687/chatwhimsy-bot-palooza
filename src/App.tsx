import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import { useEffect, useState, useCallback, useRef } from "react";
import { DialogProvider } from "./context/DialogContext";
import DialogContainer from "./components/dialogs/DialogContainer";
import { ChatProvider } from "./context/ChatContext";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";
import NavigationLock from "./components/shared/NavigationLock";
import { toast } from "@/hooks/use-toast";
import { onAuthStateChange } from "./firebase/auth";
import { UserProvider } from "./context/UserContext";

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

const AuthListener = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authListenerSetRef = useRef(false);
  const adminRedirectInProgress = useRef(false);
  
  useEffect(() => {
    console.log('AuthListener initialized, current path:', location.pathname);
    
    // Don't interfere with admin login/dashboard paths
    if (location.pathname === '/secretadminportal' || 
        location.pathname.includes('/admin')) {
      console.log('On admin page, skipping auth redirects');
      return;
    }
    
    if (!authListenerSetRef.current) {
      authListenerSetRef.current = true;
      
      const unsubscribe = onAuthStateChange((user) => {
        console.log('Firebase auth state changed:', user ? 'logged in' : 'logged out');
        
        if (!user) {
          const currentPath = location.pathname;
          
          // Avoid redirecting if we're on public paths or during admin redirect
          if (adminRedirectInProgress.current) {
            console.log('Admin redirect in progress, skipping auth redirect');
            return;
          }
          
          if (
            currentPath !== '/' && 
            currentPath !== '/vip-login' && 
            currentPath !== '/vip-signup' &&
            !currentPath.includes('/admin') &&
            currentPath !== '/secretadminportal' &&
            currentPath !== '/feedback'
          ) {
            console.log('Detected Firebase logout, redirecting to home');
            
            try {
              const savedUserData = localStorage.getItem('chatUser');
              if (savedUserData) {
                const userData = JSON.parse(savedUserData);
                if (userData.isVip) {
                  navigate('/');
                } else {
                  navigate('/feedback');
                }
                return;
              }
            } catch (e) {
              console.error('Error parsing saved user data:', e);
            }
            
            navigate('/');
          }
        }
      });
      
      return () => {
        unsubscribe();
        authListenerSetRef.current = false;
      };
    }
  }, [location.pathname, navigate]);
  
  return null;
};

const App = () => {
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [userType, setUserType] = useState<'standard' | 'vip' | null>(null);
  const logoutInProgressRef = useRef(false);
  const errorHandlerSetRef = useRef(false);
  
  useEffect(() => {
    initPerformanceMonitoring();
    
    const handleVisibilityChange = () => {
      performance.mark(`visibility_${document.visibilityState}`);
      console.info(`App visibility changed to: ${document.visibilityState}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    performance.mark('app_load_start');
    window.addEventListener('load', () => {
      performance.mark('app_load_end');
      performance.measure('App Load Time', 'app_load_start', 'app_load_end');
    });
    
    if (!errorHandlerSetRef.current) {
      const handleError = (event: ErrorEvent) => {
        if (
          event.message && 
          event.message.includes('removeChild') && 
          event.message.includes('not a child')
        ) {
          event.preventDefault();
          console.warn('Caught removeChild error during navigation, suppressing');
          
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          
          if (logoutInProgressRef.current) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
          }
          
          try {
            document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
              .forEach(el => {
                try {
                  if (el.parentNode) {
                    const isChild = Array.from(el.parentNode.childNodes).includes(el);
                    if (isChild) {
                      el.remove();
                    }
                  }
                } catch (e) {
                }
              });
          } catch (e) {
          }
          
          return false;
        }
      };
      
      window.addEventListener('error', handleError, { capture: true });
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogout = useCallback(() => {
    logoutInProgressRef.current = true;
    setHasLoggedOut(true);
  }, []);

  useEffect(() => {
    if (hasLoggedOut && window.location.pathname === '/') {
      const timer = setTimeout(() => {
        setHasLoggedOut(false);
        logoutInProgressRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoggedOut]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logoutEvent') {
        console.log('Detected logout from another tab');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <DialogProvider>
            <ChatProvider>
              <UserProvider>
                <MainLayout>
                  <Toaster />
                  <Sonner />
                  <NavigationLock />
                  <AuthListener />
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
