
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/shared/Button';
import Logo from '@/components/shared/Logo';

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your feedback',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would normally send the feedback to your backend
      console.log('Feedback submitted:', { feedbackText, email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      });
      
      setFeedbackText('');
      setEmail('');
      
      // Redirect after a short delay
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Send Feedback</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium mb-2">
              Your Feedback
            </label>
            <textarea
              id="feedback"
              rows={6}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary"
              placeholder="Tell us what you think about chatwii..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Leave your email if you'd like us to follow up with you.
            </p>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
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

export default FeedbackPage;
