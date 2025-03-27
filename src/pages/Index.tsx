
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/shared/Logo';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
            <h1 className="ml-2 text-2xl font-bold">ChatWhimsy</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/chat">
              <Button>Enter Chat</Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="icon">
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Welcome to ChatWhimsy</h1>
            <p className="text-muted-foreground text-lg">The ultimate chat experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Chat</CardTitle>
                <CardDescription>
                  Connect with others in our global chat rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Enjoy basic features like messaging, emojis, and connecting with users worldwide.</p>
              </CardContent>
              <CardFooter>
                <Link to="/chat" className="w-full">
                  <Button className="w-full">Start Chatting</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>VIP Experience</CardTitle>
                <CardDescription>
                  Unlock premium features and enhance your chat experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Gain access to voice messages, unlimited image sharing, and exclusive chat rooms.</p>
              </CardContent>
              <CardFooter>
                <Link to="/vip-login" className="w-full">
                  <Button variant="outline" className="w-full">VIP Login</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChatWhimsy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
