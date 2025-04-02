
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const AccountSettings: React.FC = () => {
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

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <p className="text-muted-foreground mb-4">
              Manage your profile information and preferences.
            </p>
            <p className="text-sm text-amber-500">
              This page is under construction. Please check back later.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AccountSettings;
