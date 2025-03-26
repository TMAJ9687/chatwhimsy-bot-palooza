
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Database, RefreshCcw, AlertTriangle } from 'lucide-react';
import { initializeFirebaseData } from '@/services/firebaseAuth';

const DatabaseInitializer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInitializeDatabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await initializeFirebaseData();
      setResult(result);
      
      if (!result.success) {
        setError(result.error || 'Failed to initialize database');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firebase Database Initializer
        </CardTitle>
        <CardDescription>
          Initialize your Firebase collections and create test data for development
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && result.success && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-400">Success!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-500">
              <div className="mt-2">
                <p>The following collections were initialized:</p>
                <ul className="list-disc list-inside mt-1 ml-2">
                  {result.collections.map((col: string) => (
                    <li key={col}>{col}</li>
                  ))}
                </ul>
              </div>
              
              {result.testData && (
                <div className="mt-2">
                  <p className="font-medium">Test Data:</p>
                  <p>{result.testData.message}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This utility will:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 ml-2">
            <li>Create all required Firestore collections</li>
            <li>Create test users (guest and VIP)</li>
            <li>Create a test chat with messages</li>
            <li>Create a test subscription</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full flex items-center gap-2" 
          onClick={handleInitializeDatabase}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Initialize Firebase Database
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseInitializer;
