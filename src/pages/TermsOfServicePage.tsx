
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const TermsOfServicePage: React.FC = () => {
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
          <h1>Terms of Service</h1>
          
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using chatwii, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          
          <h2>2. Use of the Service</h2>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all activities that occur under your account.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information.
          </p>
          
          <h2>4. User Content</h2>
          <p>
            You retain ownership of any content you submit, post, or display on or through the Service. By submitting content, you grant chatwii a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content.
          </p>
          
          <h2>5. Prohibited Conduct</h2>
          <p>
            You agree not to engage in any conduct that:
          </p>
          <ul>
            <li>Violates any applicable law or regulation</li>
            <li>Infringes on the rights of others</li>
            <li>Is harmful, fraudulent, deceptive, threatening, harassing, defamatory, obscene, or otherwise objectionable</li>
            <li>Involves sending spam or unsolicited messages</li>
            <li>Interferes with or disrupts the integrity or performance of the Service</li>
          </ul>
          
          <h2>6. Termination</h2>
          <p>
            chatwii reserves the right to terminate or suspend your access to all or part of the Service for any reason, including breach of these Terms.
          </p>
          
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
          
          <h2>8. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHATWII SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
          </p>
          
          <h2>9. Changes to Terms</h2>
          <p>
            chatwii reserves the right to modify these Terms at any time. It is your responsibility to review these Terms periodically.
          </p>
          
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@chatwii.com.
          </p>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TermsOfServicePage;
