// components/feedback/feedback-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/card";

const feedbackFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  topicId: z.string().min(1, "Please select a topic"),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface Topic {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

interface FeedbackFormProps {
  topics: Topic[];
  initialData?: FeedbackFormValues & { id?: string; status?: string };
}

export function FeedbackForm({ topics, initialData }: FeedbackFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = !!initialData?.id;

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      topicId: "",
    },
  });

  async function onSubmit(data: FeedbackFormValues) {
    if (!session?.user) {
      toast.error("You must be signed in to submit feedback");
      return;
    }

    try {
      const url = isEditing
        ? `/api/feedback/${initialData.id}`
        : "/api/feedback";

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

      const feedback = await response.json();

      toast.success(
        isEditing ? "Feedback updated successfully" : "Feedback submitted successfully"
      );
      router.push(`/feedback/feedback/${feedback.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error((error as Error).message || "Failed to save feedback");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Add a clear, concise title" {...field} />
              </FormControl>
              <FormDescription>
                Summarize your feedback in a short title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem
                      key={topic.id}
                      value={topic.id}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: topic.color }}
                        />
                        {topic.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the most relevant topic for your feedback.
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
              <Tabs defaultValue="write">
                <TabsList className="mb-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about your feedback"
                      className="min-h-32 font-mono"
                      {...field}
                    />
                  </FormControl>
                </TabsContent>
                <TabsContent value="preview">
                  <Card className="p-4 min-h-32 prose dark:prose-invert max-w-none">
                    {field.value ? (
                      <Markdown>{field.value}</Markdown>
                    ) : (
                      <p className="text-muted-foreground italic">Nothing to preview</p>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
              <FormDescription>
                Markdown formatting is supported.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">
            {isEditing ? "Update Feedback" : "Submit Feedback"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/feedback")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
