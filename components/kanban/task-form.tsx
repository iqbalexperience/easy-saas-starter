// components/kanban/task-form.tsx
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

const taskFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().optional(),
  status: z.enum(["backlog", "next-up", "in-progress", "testing", "completed"]).default("backlog").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium").optional(),
  feedbackId: z.string().min(1, "Feedback is required"),
  assigneeId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface Feedback {
  id: string;
  title: string;
  topic: {
    name: string;
    color: string;
  };
}

interface User {
  id: string;
  name: string;
  image?: string | null;
}

interface TaskFormProps {
  feedbacks: Feedback[];
  users: User[];
  initialData?: TaskFormValues & { id?: string };
  defaultFeedbackId?: string;
}

export function TaskForm({ feedbacks, users, initialData, defaultFeedbackId }: TaskFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = !!initialData?.id;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      feedbackId: defaultFeedbackId || "",
      assigneeId: "",
    },
  });

  async function onSubmit(data: TaskFormValues) {
    if (!session?.user) {
      toast.error("You must be signed in to submit tasks");
      return;
    }

    try {
      const url = isEditing
        ? `/api/tasks/${initialData.id}`
        : "/api/tasks";

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

      const task = await response.json();

      toast.success(
        isEditing ? "Task updated successfully" : "Task created successfully"
      );
      router.push(`/feedback/board/${task.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error((error as Error).message || "Failed to save task");
    }
  }

  console.log(form.getValues())

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
                <Input placeholder="Implement feature X" {...field} />
              </FormControl>
              <FormDescription>
                Summarize the task in a short title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="next-up">Next Up</SelectItem>
                    {/* <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem> */}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Current status of the task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Priority level of this task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="feedbackId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Feedback</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!defaultFeedbackId || isEditing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {feedbacks.map((feedback) => (
                      <SelectItem
                        key={feedback.id}
                        value={feedback.id}
                      >
                        <div className="flex items-center gap-2 truncate max-w-[300px]">
                          <div
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: feedback.topic.color }}
                          />
                          <span className="truncate">{feedback.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The feedback this task is related to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* <SelectItem value="">Unassigned</SelectItem> */}
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Who is assigned to work on this task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                      placeholder="Provide detailed information about this task"
                      className="min-h-32 font-mono"
                      {...field}
                      value={field.value || ""}
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
            {isEditing ? "Update Task" : "Create Task"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/feedback/board")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
