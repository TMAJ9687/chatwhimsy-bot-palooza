
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <header className="py-6 px-8 flex justify-between items-center border-b border-border">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1>Privacy Policy</h1>
          
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            At chatwii, we take your privacy seriously. This Privacy Policy explains how we collect, use, and share information about you when you use our website and services.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you:
          </p>
          <ul>
            <li>Create an account</li>
            <li>Use our messaging features</li>
            <li>Contact customer support</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          
          <p>
            This information may include your name, email address, profile information, messages, and any other information you choose to provide.
          </p>
          
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize your experience</li>
          </ul>
          
          <h2>Sharing of Information</h2>
          <p>
            We may share information about you as follows:
          </p>
          <ul>
            <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
            <li>In response to a request for information if we believe disclosure is in accordance with applicable law</li>
            <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of chatwii or others</li>
            <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company</li>
            <li>With your consent or at your direction</li>
          </ul>
          
          <h2>Data Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
          
          <h2>Your Choices</h2>
          <p>
            You can access and update certain information about you from within your account settings. You can also request that we delete your account and personal information.
          </p>
          
          <h2>Changes to this Policy</h2>
          <p>
            We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@chatwii.com.
          </p>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
