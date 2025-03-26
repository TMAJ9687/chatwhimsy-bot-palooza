
import React, { useState } from 'react';
import LandingPage from '../components/landing/LandingPage';
import DatabaseInitializer from '@/components/admin/DatabaseInitializer';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const Index = () => {
  const [showDatabaseInitializer, setShowDatabaseInitializer] = useState(false);
  
  // Check if we're in development mode (not production)
  const isDevelopment = 
    import.meta.env.MODE === 'development' || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  
  return (
    <>
      <LandingPage />
      
      {/* Only show in development mode */}
      {isDevelopment && (
        <div className="fixed bottom-4 right-4">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-background border-border shadow-md"
            onClick={() => setShowDatabaseInitializer(!showDatabaseInitializer)}
          >
            <Database className="h-4 w-4 mr-2" />
            {showDatabaseInitializer ? 'Hide' : 'Show'} Database Initializer
          </Button>
          
          {showDatabaseInitializer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-xl">
                <DatabaseInitializer />
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDatabaseInitializer(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Index;
