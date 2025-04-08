
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          Please read these Terms of Service carefully before using our Service.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree
          with any part of the terms, then you may not access the Service.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">2. User Accounts</h2>
        <p className="mb-4">
          When you create an account with us, you must provide information that is accurate,
          complete, and current at all times. Failure to do so constitutes a breach of the Terms,
          which may result in immediate termination of your account on our Service.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">3. Prohibited Activities</h2>
        <p className="mb-4">
          You agree not to use the Service for any purpose that is illegal or prohibited by
          these Terms, or to solicit the performance of any illegal activity or other activity
          which infringes the rights of our service or others.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">4. Intellectual Property</h2>
        <p className="mb-4">
          The Service and its original content, features, and functionality are and will remain
          the exclusive property of our service and its licensors. The Service is protected by
          copyright, trademark, and other laws.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">5. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account immediately, without prior notice or liability,
          for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default TermsOfService;
