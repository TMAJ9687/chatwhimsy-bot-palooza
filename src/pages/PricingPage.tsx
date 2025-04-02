
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      features: [
        'Anonymous chatting',
        'Basic message features',
        'Standard support',
        'Limited conversations'
      ],
      cta: 'Start Free',
      variant: 'outline' as const
    },
    {
      name: 'VIP',
      price: '$4.99/month',
      features: [
        'All basic features',
        'Unlimited conversations',
        'Image sharing',
        'Voice messages',
        'Priority support',
        'Ad-free experience'
      ],
      cta: 'Get VIP',
      variant: 'primary' as const
    },
    {
      name: 'Premium',
      price: '$9.99/month',
      features: [
        'All VIP features',
        'Message translation',
        'Advanced chat filters',
        'Premium themes',
        'Early access to new features',
        'VIP support'
      ],
      cta: 'Go Premium',
      variant: 'outline' as const
    }
  ];

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

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you and start chatting with enhanced features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`border rounded-lg p-8 flex flex-col h-full 
                ${plan.name === 'VIP' ? 'bg-secondary/10 border-secondary' : ''}`}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <div className="text-3xl font-bold mt-2">{plan.price}</div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                variant={plan.variant}
                className="w-full"
                onClick={() => navigate('/vip-subscription')}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Have Questions?</h3>
          <p className="text-muted-foreground mb-6">
            Contact our support team for any questions about our pricing plans or features.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/feedback')}
          >
            Contact Support
          </Button>
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

export default PricingPage;
