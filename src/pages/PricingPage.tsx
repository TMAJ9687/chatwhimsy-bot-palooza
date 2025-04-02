
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <header className="py-6 px-8 flex justify-between items-center border-b border-border">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link to="/chat" className="text-muted-foreground hover:text-foreground">
            Chat
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you and start chatting with people from around the world.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden border border-border">
            <div className="p-6">
              <h3 className="text-lg font-medium">Free</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $0
                <span className="ml-1 text-xl text-muted-foreground font-normal">/month</span>
              </div>
              <p className="mt-5 text-muted-foreground">
                Perfect for casual users who want to try out the platform.
              </p>
            </div>
            <div className="border-t border-border bg-muted/50 px-6 py-4">
              <ul className="space-y-3">
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Basic chat features</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">5 message exchanges per day</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Limited features</span>
                </li>
              </ul>
            </div>
            <div className="px-6 py-4">
              <button className="w-full bg-muted hover:bg-muted/75 py-2 px-4 rounded-md">
                Current Plan
              </button>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden border border-primary relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
              Popular
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium">Premium</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $9.99
                <span className="ml-1 text-xl text-muted-foreground font-normal">/month</span>
              </div>
              <p className="mt-5 text-muted-foreground">
                For users who want the full chat experience.
              </p>
            </div>
            <div className="border-t border-border bg-muted/50 px-6 py-4">
              <ul className="space-y-3">
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">All free features</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Unlimited messaging</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Voice & image sharing</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Priority support</span>
                </li>
              </ul>
            </div>
            <div className="px-6 py-4">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md">
                Upgrade Now
              </button>
            </div>
          </div>
          
          {/* Enterprise Plan */}
          <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden border border-border">
            <div className="p-6">
              <h3 className="text-lg font-medium">Enterprise</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $19.99
                <span className="ml-1 text-xl text-muted-foreground font-normal">/month</span>
              </div>
              <p className="mt-5 text-muted-foreground">
                For power users who need advanced features.
              </p>
            </div>
            <div className="border-t border-border bg-muted/50 px-6 py-4">
              <ul className="space-y-3">
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">All premium features</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Custom profile themes</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Advanced analytics</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">24/7 dedicated support</span>
                </li>
              </ul>
            </div>
            <div className="px-6 py-4">
              <button className="w-full border border-input bg-card hover:bg-accent hover:text-accent-foreground py-2 px-4 rounded-md">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border mt-12">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PricingPage;
