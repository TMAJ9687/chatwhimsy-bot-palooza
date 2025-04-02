
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const FeedbackPage: React.FC = () => {
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
          <h1 className="text-3xl font-bold mb-8">Feedback</h1>
          
          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Share Your Thoughts</h2>
            <p className="text-muted-foreground mb-6">
              We appreciate your feedback to improve our platform.
            </p>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="feedback-type" className="block text-sm font-medium mb-1">
                  Feedback Type
                </label>
                <select 
                  id="feedback-type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="issue">Issue Report</option>
                  <option value="compliment">Compliment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium mb-1">
                  Your Feedback
                </label>
                <textarea
                  id="feedback-message"
                  rows={5}
                  placeholder="Tell us what you think..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FeedbackPage;
