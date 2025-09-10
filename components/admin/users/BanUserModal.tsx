// components/admin/users/BanUserModal.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User } from "@/lib/types/user";
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
import { Badge } from "@/components/ui/badge";

const banFormSchema = z.object({
  banReason: z.string().min(3, "Reason must be at least 3 characters"),
  banDuration: z.string(),
});

type BanFormValues = z.infer<typeof banFormSchema>;

interface BanUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function BanUserModal({ user, isOpen, onClose }: BanUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      banReason: "",
      banDuration: "7days",
    },
  });

  const handleUnban = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.admin.unbanUser({
        userId: user.id,
      });

      if (error) {
        toast.error("Failed to unban user");
        return;
      }

      toast.success(`${user.name} has been unbanned`);
      onClose();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const { error } = await authClient.admin.banUser({
        userId: user.id,
        banReason: values.banReason,
        banExpiresIn: banExpiresIn === 0 ? undefined : banExpiresIn,
      });

      if (error) {
        toast.error("Failed to ban user");
        return;
      }

      toast.success(`${user.name} has been banned`);
      onClose();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user.banned) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              <span>Are you sure you want to unban {user.name}?</span>
              {user.banReason && (
                <Badge variant={"secondary"}>Current ban reason: {user.banReason}</Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleUnban} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Unban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            This will prevent {user.name} from accessing the platform.
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
                      placeholder="Explain why this user is being banned..."
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
                {isSubmitting ? "Processing..." : "Ban User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
