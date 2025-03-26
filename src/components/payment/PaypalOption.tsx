
import React from 'react';

export const PaypalOption: React.FC = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
      <p className="text-sm">
        You will be redirected to PayPal to complete your payment securely.
      </p>
    </div>
  );
};
