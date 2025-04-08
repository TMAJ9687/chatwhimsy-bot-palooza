
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService: React.FC = () => {
  return (
    <div className="flex justify-center p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our service, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>

          <h2 className="text-xl font-semibold">2. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2 className="text-xl font-semibold">3. User Conduct</h2>
          <p>
            You agree not to use our service to engage in any prohibited behaviors, including
            harassment, impersonation of others, sharing illegal or harmful content, or
            attempting to interfere with the proper functioning of the service.
          </p>

          <h2 className="text-xl font-semibold">4. Content Ownership</h2>
          <p>
            Users retain all ownership rights to content they create and share through our service.
            However, by posting content, you grant us a license to use, store, and display that content
            in connection with providing the service.
          </p>

          <h2 className="text-xl font-semibold">5. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice
            of significant changes by updating the "Last Updated" date at the bottom of this page.
            Your continued use of the service after such modifications constitutes your acceptance
            of the revised terms.
          </p>
          
          <div className="pt-4 text-sm text-muted-foreground">
            Last Updated: April 8, 2025
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
