
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // In a real app, this would send the feedback to your server
      console.log('Submitting feedback:', { rating, feedback });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve our service.",
      });
      
      // Redirect to login after successful submission
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    navigate('/login');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Expired</CardTitle>
          <CardDescription>
            Your session has expired due to inactivity. Before you go, would you like to share your feedback?
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">How would you rate your experience?</h3>
              <RadioGroup 
                value={rating || ''} 
                onValueChange={setRating}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map(value => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`rating-${value}`} 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor={`rating-${value}`}
                      className="cursor-pointer flex flex-col items-center p-2 rounded-md peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                    >
                      <span className="text-2xl">{value}</span>
                      <span className="text-xs mt-1">
                        {value === 1 ? 'Poor' : 
                         value === 2 ? 'Fair' : 
                         value === 3 ? 'Good' : 
                         value === 4 ? 'Great' : 'Excellent'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Any additional comments?</Label>
              <Textarea 
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts with us..."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full"
            >
              Skip
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackPage;
