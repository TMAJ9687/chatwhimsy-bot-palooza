
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminSettings: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your admin settings and preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Update your admin security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <div className="space-y-4">
                <FormField
                  name="current-password"
                  render={() => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your current password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="new-password"
                  render={() => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your new password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="confirm-password"
                  render={() => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your new password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Password</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch id="email-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="user-reports">User Reports</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get notified when a user submits a report
                  </p>
                </div>
                <Switch id="user-reports" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-registrations">New Registrations</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get notified about new user registrations
                  </p>
                </div>
                <Switch id="new-registrations" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure global system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Put the site in maintenance mode (only admins can access)
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="user-registration">User Registration</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Allow new users to register on the site
                  </p>
                </div>
                <Switch id="user-registration" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-delete-reports">Auto-Delete Reports</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Automatically delete resolved reports after 30 days
                  </p>
                </div>
                <Switch id="auto-delete-reports" defaultChecked />
              </div>
              
              <Button type="submit">Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
