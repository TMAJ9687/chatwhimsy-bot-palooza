
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/shared/ThemeToggle';
import Logo from '@/components/shared/Logo';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo variant="full" />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-6 mr-4">
            <Link to="/pricing" className="text-foreground/80 hover:text-foreground">Pricing</Link>
            <Link to="/chat" className="text-foreground/80 hover:text-foreground">Chat</Link>
            <Link to="/feedback" className="text-foreground/80 hover:text-foreground">Feedback</Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to chatwii</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with people from around the world instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/chat"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium"
            >
              Start Chatting
            </Link>
            <Link
              to="/secretadminportal"
              className="border border-input hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} chatwii. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
