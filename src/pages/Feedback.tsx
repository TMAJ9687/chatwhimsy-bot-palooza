
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit to 140 characters
    if (e.target.value.length <= 140) {
      setFeedback(e.target.value);
    }
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate submission with a slight delay
    setTimeout(() => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      
      setIsSubmitting(false);
      navigate('/');
    }, 800);
  };
  
  const handleSkip = () => {
    navigate('/');
  };
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">We Value Your Feedback</CardTitle>
          <CardDescription>
            Please share your experience with our chat application
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">How would you rate your experience?</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      rating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Feedback Text */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="feedback" className="block text-sm font-medium">
                Tell us more (optional)
              </label>
              <span className="text-xs text-gray-500">
                {feedback.length}/140
              </span>
            </div>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={handleTextChange}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Feedback;
