
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          This Privacy Policy describes how we collect, use, and disclose your information
          when you use our service.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">Information We Collect</h2>
        <p className="mb-4">
          We collect information that you provide directly to us when you register for an account,
          create or modify your profile, set preferences, or make purchases through the Service.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to provide, maintain, and improve our services,
          which includes using the data to improve and personalize your experience.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">Information Sharing and Disclosure</h2>
        <p className="mb-4">
          We do not share or sell your personal information with third parties except as
          described in this privacy policy.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">Security</h2>
        <p className="mb-4">
          We take reasonable measures to help protect your personal information from loss,
          theft, misuse, unauthorized access, disclosure, alteration, and destruction.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-3">Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update this privacy policy from time to time. We will notify you of any
          changes by posting the new privacy policy on this page.
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

export default PrivacyPolicy;
