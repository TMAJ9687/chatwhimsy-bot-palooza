
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/shared/Logo';
import { BookOpen, LogIn, MessageSquare, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <Logo size="lg" className="mb-6" />
        <h1 className="text-4xl font-bold mb-4">Welcome to chatwii</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Connect with an AI assistant for meaningful conversations and personalized support.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" as={Link} to="/chat">
            <MessageSquare className="mr-2 h-5 w-5" />
            Start Chatting
          </Button>
          <Button size="lg" variant="outline" as={Link} to="/vip-signup">
            <Sparkles className="mr-2 h-5 w-5" />
            Upgrade to VIP
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Free Chat</CardTitle>
            <CardDescription>Start chatting with our AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                </div>
                <span>Quick responses</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                </div>
                <span>Helpful assistance</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                </div>
                <span>Available 24/7</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button fullWidth={true} as={Link} to="/chat">
              Chat Now
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-orange border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>VIP Access</CardTitle>
                <CardDescription>Premium features and benefits</CardDescription>
              </div>
              <div className="bg-orange text-white px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                </div>
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                </div>
                <span>Advanced features</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                </div>
                <span>Personalized experience</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                </div>
                <span>No advertisements</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button fullWidth={true} variant="orange" as={Link} to="/vip-signup">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>For approved administrators only</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
                <span>User management</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
                <span>Analytics dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
                <span>System configuration</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button fullWidth={true} variant="outline" as={Link} to="/secretadminportal">
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <Link 
          to="/design-system" 
          className="inline-flex items-center text-primary hover:underline"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          View Design System
        </Link>
      </div>
    </div>
  );
};

export default Index;
