// components/topics/topic-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const topicFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").default("#0284c7").optional(),
  icon: z.string().optional(),
});

type TopicFormValues = z.infer<typeof topicFormSchema>;

interface TopicFormProps {
  initialData?: TopicFormValues & { id?: string };
}

export function TopicForm({ initialData }: TopicFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      color: "#0284c7",
      icon: "",
    },
  });

  async function onSubmit(data: TopicFormValues) {
    try {
      const url = isEditing
        ? `/api/topics/${initialData.id}`
        : "/api/topics";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      toast.success(
        isEditing ? "Topic updated successfully" : "Topic created successfully"
      );
      router.push("/topics");
      router.refresh();
    } catch (error) {
      console.error("Error submitting topic:", error);
      toast.error((error as Error).message || "Failed to save topic");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Feature requests" {...field} />
              </FormControl>
              <FormDescription>
                The name of the topic for organizing feedback.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ideas for new features and functionality"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A brief description of what this topic is about.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input type="color" {...field} className="w-12 h-10 p-1" />
                </FormControl>
                <Input
                  {...field}
                  className="w-32"
                  onChange={(e) => {
                    // Ensure the value is a valid hex color
                    const value = e.target.value;
                    if (value.startsWith('#') && (value.length <= 7)) {
                      field.onChange(value);
                    }
                  }}
                />
              </div>
              <FormDescription>
                The color used to identify this topic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (optional)</FormLabel>
              <FormControl>
                <Input placeholder="lightbulb" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                A Lucide icon name to represent this topic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit">
            {isEditing ? "Update Topic" : "Create Topic"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/topics")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
