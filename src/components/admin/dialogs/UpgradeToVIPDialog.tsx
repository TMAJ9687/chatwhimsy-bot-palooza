
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form validation schema for upgrading a user to VIP
const upgradeToVIPSchema = z.object({
  duration: z.enum(['1 Day', '1 Week', '1 Month', '1 Year', 'Lifetime']),
});

interface UpgradeToVIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
  onUpgradeToVIP: (values: z.infer<typeof upgradeToVIPSchema>) => void;
}

const UpgradeToVIPDialog: React.FC<UpgradeToVIPDialogProps> = ({
  open,
  onOpenChange,
  selectedUser,
  onUpgradeToVIP
}) => {
  const form = useForm<z.infer<typeof upgradeToVIPSchema>>({
    resolver: zodResolver(upgradeToVIPSchema),
    defaultValues: {
      duration: "1 Month",
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade to VIP</AlertDialogTitle>
          <AlertDialogDescription>
            {selectedUser && `You are about to upgrade ${selectedUser.name} to VIP status.`}
            Please select a duration for the VIP membership.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onUpgradeToVIP)} className="space-y-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIP Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 Day">1 Day</SelectItem>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                      <SelectItem value="1 Month">1 Month</SelectItem>
                      <SelectItem value="1 Year">1 Year</SelectItem>
                      <SelectItem value="Lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit">Upgrade User</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpgradeToVIPDialog;
