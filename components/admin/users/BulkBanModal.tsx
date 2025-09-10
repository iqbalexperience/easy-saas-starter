// components/admin/users/BulkBanModal.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const banFormSchema = z.object({
  banReason: z.string().min(3, "Reason must be at least 3 characters"),
  banDuration: z.string(),
});

type BanFormValues = z.infer<typeof banFormSchema>;

interface BulkBanModalProps {
  userIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkBanModal({ 
  userIds, 
  isOpen, 
  onClose,
  onSuccess 
}: BulkBanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      banReason: "",
      banDuration: "7days",
    },
  });
  
  const onSubmit = async (values: BanFormValues) => {
    setIsSubmitting(true);
    
    // Convert duration to seconds
    let banExpiresIn: number;
    switch (values.banDuration) {
      case "1hour":
        banExpiresIn = 60 * 60;
        break;
      case "24hours":
        banExpiresIn = 60 * 60 * 24;
        break;
      case "7days":
        banExpiresIn = 60 * 60 * 24 * 7;
        break;
      case "30days":
        banExpiresIn = 60 * 60 * 24 * 30;
        break;
      case "permanent":
        banExpiresIn = 0; // Or however the API handles permanent bans
        break;
      default:
        banExpiresIn = 60 * 60 * 24 * 7; // Default to 7 days
    }
    
    try {
      let successCount = 0;
      
      for (const userId of userIds) {
        const { error } = await authClient.admin.banUser({
          userId,
          banReason: values.banReason,
          banExpiresIn: banExpiresIn === 0 ? undefined : banExpiresIn,
        });
        
        if (!error) {
          successCount++;
        }
      }
      
      if (successCount === userIds.length) {
        toast.success(`Successfully banned ${successCount} users`);
      } else {
        toast.warning(`Banned ${successCount} of ${userIds.length} users`);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Multiple Users</DialogTitle>
          <DialogDescription>
            This will prevent {userIds.length} users from accessing the platform.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="banReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Ban</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why these users are being banned..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="banDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ban Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1hour">1 Hour</SelectItem>
                      <SelectItem value="24hours">24 Hours</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? `Banning ${userIds.length} users...` : `Ban ${userIds.length} Users`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
