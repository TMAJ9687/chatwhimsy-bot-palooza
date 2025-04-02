
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const TermsOfServicePage: React.FC = () => {
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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the chatwii service, you agree to be bound by these Terms of Service.
          </p>
          
          <h2>2. Description of Service</h2>
          <p>
            chatwii provides an anonymous chat platform that allows users to communicate with others 
            without revealing their identity.
          </p>
          
          <h2>3. User Conduct</h2>
          <p>
            Users are prohibited from engaging in any illegal activities, harassment, or sharing of 
            inappropriate content. chatwii reserves the right to terminate access for violations.
          </p>
          
          <h2>4. Privacy</h2>
          <p>
            Please refer to our Privacy Policy for information on how we collect, use, and disclose 
            information from our users.
          </p>
          
          <h2>5. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify users of any significant changes.
          </p>
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

export default TermsOfServicePage;
