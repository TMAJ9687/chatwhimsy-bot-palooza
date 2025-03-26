
import React from 'react';
import { Check } from 'lucide-react';

export const SubscriptionBenefits: React.FC = () => {
  const benefits = [
    'Send unlimited photos',
    'Send unlimited voice messages',
    'Chat history view',
    'Find matches by interests',
    'Customer Support',
    'Customized avatars',
    'Appear at top of the list',
    'Ad free experience'
  ];

  return (
    <div className="mt-6">
      <div className="border-t pt-4">
        <h3 className="font-medium text-lg mb-3">VIP Benefits</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
