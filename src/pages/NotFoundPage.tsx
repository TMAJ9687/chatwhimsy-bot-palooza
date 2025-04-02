
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <h2 className="text-3xl font-bold mt-4 mb-6">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Return Home
          </Link>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
