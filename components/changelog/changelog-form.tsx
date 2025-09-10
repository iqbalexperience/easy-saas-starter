// components/changelog/changelog-form.tsx
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
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/card";

const changelogFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  taskId: z.string().min(1, "Task is required"),
});

type ChangelogFormValues = z.infer<typeof changelogFormSchema>;

interface Task {
  id: string;
  title: string;
  status: string;
  hasChangelog: boolean;
}

interface ChangelogFormProps {
  tasks: Task[];
  initialData?: ChangelogFormValues & { id?: string };
  defaultTaskId?: string;
}

export function ChangelogForm({ tasks, initialData, defaultTaskId }: ChangelogFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = !!initialData?.id;

  const form = useForm<ChangelogFormValues>({
    resolver: zodResolver(changelogFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      taskId: defaultTaskId || "",
    },
  });

  async function onSubmit(data: ChangelogFormValues) {
    if (!session?.user) {
      toast.error("You must be signed in to submit changelogs");
      return;
    }

    try {
      const url = isEditing
        ? `/api/changelog/${initialData.id}`
        : "/api/changelog";

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

      const changelog = await response.json();

      toast.success(
        isEditing ? "Changelog updated successfully" : "Changelog created successfully"
      );
      router.push(`/feedback/changelog/${changelog.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting changelog:", error);
      toast.error((error as Error).message || "Failed to save changelog");
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
                <Input placeholder="Added feature X" {...field} />
              </FormControl>
              <FormDescription>
                A concise title describing what was implemented.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completed Task</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={!!defaultTaskId || isEditing}
                >
                  <option value="">Select a completed task</option>
                  {tasks.map((task) => (
                    <option
                      key={task.id}
                      value={task.id}
                      disabled={task.hasChangelog}
                    >
                      {task.title} {task.hasChangelog ? " (Already has changelog)" : ""}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                The completed task this changelog entry is for.
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
                      placeholder="Describe what was implemented, how it works, and any other relevant details"
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
                Provide details about the changes. Markdown formatting is supported.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">
            {isEditing ? "Update Changelog" : "Create Changelog"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/feedback/changelog")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
