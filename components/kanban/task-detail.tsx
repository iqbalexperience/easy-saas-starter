// components/kanban/task-detail.tsx
// Update the existing component to add a "Create Changelog" button for completed tasks

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Pencil, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    creator: {
      id: string;
      name: string;
      image?: string | null;
    };
    assignee?: {
      id: string;
      name: string;
      image?: string | null;
    } | null;
    feedback: {
      id: string;
      title: string;
      topic: {
        id: string;
        name: string;
        color: string;
      };
      user: {
        id: string;
        name: string;
        image?: string | null;
      };
    };
    changelog?: {
      id: string;
    } | null;
  };
  isAuthorized: boolean;
  canDelete: boolean
}

export function TaskDetail({ task, isAuthorized, canDelete }: TaskDetailProps) {
  const createdAt = new Date(task.createdAt);
  const updatedAt = new Date(task.updatedAt);

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "backlog":
        return "outline";
      case "next-up":
        return "default";
      case "in-progress":
        return "secondary";
      case "testing":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "default";
    }
  };

  // Priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "default";
      case "high":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "default";
    }
  };

  // Check if task is completed and has no changelog
  const canCreateChangelog = isAuthorized && task.status === "completed" && !task.changelog;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(task.status)}>
              {task.status.replace(/-/g, " ")}
            </Badge>
            <Badge variant={getPriorityVariant(task.priority)}>
              {task.priority} priority
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1"
              style={{ borderColor: task.feedback.topic.color, color: task.feedback.topic.color }}
            >
              {task.feedback.topic.name}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canCreateChangelog && (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/feedback/changelog/new?task=${task.id}`}>
                <FileText className="h-4 w-4 mr-1" />
                Create Changelog
              </Link>
            </Button>
          )}
          {isAuthorized && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/feedback/board/${task.id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Link href={`/feedback/board/${task.id}/delete`} className={buttonVariants({ variant: "destructive", size: "sm" })}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Link>
          )}

        </div>
      </CardHeader>
      <CardContent className="py-4">
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm mb-2">
            <span className="font-medium">Related Feedback:</span>{" "}
            <Link
              href={`/feedback/feedback/${task.feedback.id}`}
              className="hover:underline flex items-center "
            >
              {task.feedback.title}
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.feedback.user.image || ""} alt={task.feedback.user.name} />
              <AvatarFallback className="text-xs">{getInitials(task.feedback.user.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              Submitted by {task.feedback.user.name}
            </span>
          </div>
        </div>

        {task.changelog && (
          <div className="mb-4 p-3 bg-accent/10 rounded-md">
            <p className="text-sm font-medium flex items-center">
              This task has a changelog entry
              <Link
                href={`/feedback/changelog/${task.changelog.id}`}
                className="ml-2 text-accent hover:underline inline-flex items-center"
              >
                View Changelog
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          {task.description ? (
            <Markdown>{task.description}</Markdown>
          ) : (
            <p className="text-muted-foreground italic">No description provided</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center border-t">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={task.creator.image || ""} alt={task.creator.name} />
              <AvatarFallback>{getInitials(task.creator.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm">Created by</p>
              <p className="text-xs font-medium">{task.creator.name}</p>
            </div>
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={task.assignee.image || ""} alt={task.assignee.name} />
                <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">Assigned to</p>
                <p className="text-xs font-medium">{task.assignee.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <p>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</p>
          <p>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
