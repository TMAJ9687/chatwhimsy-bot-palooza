
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-8">
          <span className="text-9xl font-bold text-muted-foreground">404</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Button
            variant="primary"
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
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

export default NotFoundPage;
