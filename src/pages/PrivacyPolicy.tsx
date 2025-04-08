
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex justify-center p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, 
            update your profile, or use our chat features. This may include your name, email address,
            profile information, and any messages you send through our platform.
          </p>

          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services,
            communicate with you, and personalize your experience. We may also use the data
            to monitor and analyze trends, usage, and activities in connection with our services.
          </p>

          <h2 className="text-xl font-semibold">3. Data Security</h2>
          <p>
            We implement reasonable measures designed to protect your information from
            unauthorized access, use, or disclosure. However, no internet transmission is
            completely secure, so we cannot guarantee the absolute security of your data.
          </p>

          <h2 className="text-xl font-semibold">4. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <div className="pt-4 text-sm text-muted-foreground">
            Last Updated: April 8, 2025
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
