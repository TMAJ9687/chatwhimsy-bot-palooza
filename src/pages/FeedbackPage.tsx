
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FeedbackPage: React.FC = () => {
  const [rating, setRating] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, send feedback to server
    console.log({ rating, feedback });
    
    // Show success message
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
      duration: 3000
    });
    
    setSubmitted(true);
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleGoHome}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Session Ended</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-4">
                Your session has expired due to inactivity. We'd appreciate your feedback about your experience.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium mb-2">How would you rate your experience?</p>
                <RadioGroup 
                  value={rating} 
                  onValueChange={setRating}
                  className="flex space-x-4"
                >
                  {['Poor', 'Fair', 'Good', 'Excellent'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option.toLowerCase()} />
                      <Label htmlFor={option.toLowerCase()}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="feedback" className="font-medium">Additional feedback (optional)</Label>
                <Textarea 
                  id="feedback"
                  placeholder="Tell us about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!rating}
            >
              Submit Feedback
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoHome}
              className="flex-1"
            >
              Skip & Return Home
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackPage;
