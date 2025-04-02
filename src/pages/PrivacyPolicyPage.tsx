
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const PrivacyPolicyPage: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert">
          <h2>1. Information We Collect</h2>
          <p>
            We collect minimal information required to provide the chatwii service. This includes chat messages, 
            nickname, and basic usage statistics.
          </p>
          
          <h2>2. How We Use Information</h2>
          <p>
            We use collected information to provide, maintain, and improve our services, as well as to ensure 
            compliance with our Terms of Service.
          </p>
          
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell or share your information with third parties except as required by law or to protect 
            our rights and safety.
          </p>
          
          <h2>4. Data Retention</h2>
          <p>
            Chat data is retained for a limited period and automatically deleted thereafter to maintain privacy.
          </p>
          
          <h2>5. Changes to Privacy Policy</h2>
          <p>
            We may update this policy from time to time. We will notify users of any significant changes.
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

export default PrivacyPolicyPage;
