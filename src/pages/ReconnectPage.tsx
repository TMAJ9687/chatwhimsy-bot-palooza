
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Clock } from 'lucide-react';
import { useIdleDetection } from '@/hooks/useIdleDetection';

const ReconnectPage = () => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    timestamp: string;
    expiresAt: string;
  } | null>(null);
  
  const { handleReconnect, handleSessionExpired } = useIdleDetection();
  
  // Load user data and set up countdown timer
  useEffect(() => {
    const storedUserData = localStorage.getItem('reconnectUser');
    
    if (!storedUserData) {
      // No reconnect data found, redirect to home
      navigate('/');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      
      // Calculate time remaining
      const expiresAt = new Date(parsedData.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeRemaining(remaining);
      
      // If already expired, handle expiration
      if (remaining <= 0) {
        handleSessionExpired();
        return;
      }
      
      // Set up countdown timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSessionExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error parsing reconnect data:', error);
      navigate('/');
    }
  }, [navigate, handleSessionExpired]);
  
  // Format time remaining as mm:ss
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!userData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Paused</CardTitle>
          <CardDescription>
            Your session was paused due to inactivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
              <Clock className="mr-2 h-6 w-6" />
              {formatTimeRemaining()}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Time remaining before session expires
            </p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="mb-1"><span className="font-semibold">Name:</span> {userData.name}</p>
            {userData.email && <p><span className="font-semibold">Email:</span> {userData.email}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleReconnect} 
            className="w-full"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconnect Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReconnectPage;
