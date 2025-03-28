import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  onProfileComplete?: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileComplete }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load name from local storage on component mount
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setName(storedName);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Simulate saving the profile
    setTimeout(() => {
      localStorage.setItem('userName', name);
      setIsSubmitting(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Call the onProfileComplete callback if it exists
      if (onProfileComplete) {
        onProfileComplete();
      }
    }, 1500);
  };

  return (
    <div className="container max-w-md mx-auto py-10">
      <Link to="/" className="flex items-center mb-4 text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Choose how you want to appear in the chat
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileSetup;
