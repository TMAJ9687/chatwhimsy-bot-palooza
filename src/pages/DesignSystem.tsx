
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ColorPalette } from '@/components/ui/color-palette';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Logo from '@/components/shared/Logo';

import { Check, ChevronRight, Home, LogIn, Menu, Plus, Settings, Sparkles, X } from 'lucide-react';

const DesignSystem = () => {
  return (
    <div className="container mx-auto py-10 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">chatwii Design System</h1>
        <p className="text-lg text-muted-foreground">
          A showcase of all UI components and design tokens used in the chatwii application.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="space-y-8 mt-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Logo</h2>
            <div className="flex items-center gap-8">
              <div className="space-y-2 flex flex-col items-center">
                <Logo size="sm" />
                <span className="text-sm text-muted-foreground">Small</span>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <Logo size="md" />
                <span className="text-sm text-muted-foreground">Medium</span>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <Logo size="lg" />
                <span className="text-sm text-muted-foreground">Large</span>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-4">
              <div className="space-y-2 flex flex-col items-center">
                <Logo variant="text" />
                <span className="text-sm text-muted-foreground">Text variant</span>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Buttons</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Button variant="default">Default</Button>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary">Secondary</Button>
                <span className="text-sm text-muted-foreground">Secondary</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline">Outline</Button>
                <span className="text-sm text-muted-foreground">Outline</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost">Ghost</Button>
                <span className="text-sm text-muted-foreground">Ghost</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="link">Link</Button>
                <span className="text-sm text-muted-foreground">Link</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="destructive">Destructive</Button>
                <span className="text-sm text-muted-foreground">Destructive</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="teal">Teal</Button>
                <span className="text-sm text-muted-foreground">Teal</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="orange">Orange</Button>
                <span className="text-sm text-muted-foreground">Orange</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="red">Red</Button>
                <span className="text-sm text-muted-foreground">Red</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="glass">Glass</Button>
                <span className="text-sm text-muted-foreground">Glass</span>
              </div>
              <div className="flex flex-col gap-2 dark">
                <Button variant="glass-dark">Glass Dark</Button>
                <span className="text-sm text-muted-foreground">Glass Dark</span>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8">Button Sizes</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex flex-col gap-2 items-center">
                <Button size="xs">XS</Button>
                <span className="text-sm text-muted-foreground">XS</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="sm">Small</Button>
                <span className="text-sm text-muted-foreground">Small</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="default">Default</Button>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="lg">Large</Button>
                <span className="text-sm text-muted-foreground">Large</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="xl">XL</Button>
                <span className="text-sm text-muted-foreground">XL</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
                <span className="text-sm text-muted-foreground">Icon</span>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8">Button Animations</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex flex-col gap-2 items-center">
                <Button animation="scale">Scale</Button>
                <span className="text-sm text-muted-foreground">Scale</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button animation="pulse">Pulse</Button>
                <span className="text-sm text-muted-foreground">Pulse</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button animation="bounce">Bounce</Button>
                <span className="text-sm text-muted-foreground">Bounce</span>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8">Button Rounded</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="default">Default</Button>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="lg">Large</Button>
                <span className="text-sm text-muted-foreground">Large</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="xl">XL</Button>
                <span className="text-sm text-muted-foreground">XL</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="full">Full</Button>
                <span className="text-sm text-muted-foreground">Full</span>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8">With Icons</h3>
            <div className="flex gap-4 flex-wrap">
              <Button>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
              <Button>
                Settings <Settings className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> New item
              </Button>
            </div>

            <h3 className="text-xl font-bold mt-8">Full Width</h3>
            <Button fullWidth={true}>Full Width Button</Button>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Cards</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description that explains what this card is used for.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here. This is the main content area of the card.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost">Cancel</Button>
                  <Button>Submit</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>With icon and badge</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange" />
                    <p className="font-medium">Premium Feature</p>
                  </div>
                  <p>This card showcases a premium feature with an icon.</p>
                  <Badge variant="secondary">New</Badge>
                </CardContent>
                <CardFooter>
                  <Button variant="default" fullWidth={true}>Upgrade Now</Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-teal-200 to-teal-500"></div>
                <CardHeader>
                  <CardTitle>Card with Image</CardTitle>
                  <CardDescription>Visual card with gradient header</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card with a decorative header gradient for visual appeal.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Learn More <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Badges</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <Badge>Default</Badge>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <span className="text-sm text-muted-foreground">Secondary</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge variant="outline">Outline</Badge>
                <span className="text-sm text-muted-foreground">Outline</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge variant="destructive">Destructive</Badge>
                <span className="text-sm text-muted-foreground">Destructive</span>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Form Controls</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="font-medium">Checkbox</div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accept terms and conditions
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Switch</div>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <label
                    htmlFor="airplane-mode"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Airplane Mode
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Slider</div>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </div>
          </section>

        </TabsContent>
        
        <TabsContent value="colors" className="space-y-4 mt-6">
          <ColorPalette />
        </TabsContent>
        
        <TabsContent value="typography" className="space-y-8 mt-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Typography</h2>
            
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <p className="text-sm text-muted-foreground">text-3xl font-bold</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold">Heading 3</h3>
                <p className="text-sm text-muted-foreground">text-2xl font-bold</p>
              </div>
              
              <div>
                <h4 className="text-xl font-bold">Heading 4</h4>
                <p className="text-sm text-muted-foreground">text-xl font-bold</p>
              </div>
              
              <div>
                <h5 className="text-lg font-bold">Heading 5</h5>
                <p className="text-sm text-muted-foreground">text-lg font-bold</p>
              </div>
              
              <div>
                <h6 className="text-base font-bold">Heading 6</h6>
                <p className="text-sm text-muted-foreground">text-base font-bold</p>
              </div>
              
              <div>
                <p className="text-base">Base text - The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">text-base</p>
              </div>
              
              <div>
                <p className="text-sm">Small text - The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">text-sm</p>
              </div>
              
              <div>
                <p className="text-xs">Extra small text - The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">text-xs</p>
              </div>
              
              <div>
                <p className="text-lg">Large text - The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">text-lg</p>
              </div>
              
              <div>
                <p className="text-xl">Extra large text - The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">text-xl</p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Muted text - The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground">text-muted-foreground</p>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignSystem;
