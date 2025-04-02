
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/secretadminportal')}
          >
            Admin Portal
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/chat')}
          >
            Start Chatting
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-6">Welcome to Chatwii</h1>
          <p className="text-xl mb-8">
            Your anonymous chatting platform. Connect with others and chat freely!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/chat')}
            >
              Start Chatting
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/feedback')}
            >
              Send Feedback
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <div className="flex justify-center gap-6">
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/feedback" className="hover:underline">Feedback</a>
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
