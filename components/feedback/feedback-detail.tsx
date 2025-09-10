// components/feedback/feedback-detail.tsx
// Update the existing component to add a "Convert to Task" button for admins/developers

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Tag, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import { UpvoteButton } from "./upvote-button";
import * as LucideIcons from "lucide-react";

interface FeedbackDetailProps {
  feedback: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string | Date;
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
    topic: {
      id: string;
      name: string;
      color: string;
      icon?: string | null;
    };
    _count: {
      upvotes: number;
      tasks: number;
    };
  };
  isAuthor: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
}

export function FeedbackDetail({ feedback, isAuthor, isAdmin, isDeveloper }: FeedbackDetailProps) {
  const createdAt = new Date(feedback.createdAt);

  // Get icon component if available
  const getIconComponent = (iconName?: string | null) => {
    if (!iconName) return Tag;

    // @ts-ignore - Lucide icons have a dynamic structure
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Tag;
  };

  const TopicIcon = getIconComponent(feedback.topic.icon);

  // Generate initials for avatar fallback
  const initials = feedback.user.name
    ? feedback.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U";

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "indev";
      case "in-development":
        return "success";
      case "completed":
        return "secondary";
      case "closed":
        return "closed";
      default:
        return "default";
    }
  };

  // Whether user can convert to task
  const canConvertToTask = (isAdmin || isDeveloper) &&
    (feedback.status === "open" || feedback.status === "in-development") &&
    feedback._count.tasks === 0;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{feedback.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(feedback.status)}>
              {feedback.status.replace("-", " ")}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1"
              style={{ borderColor: feedback.topic.color, color: feedback.topic.color }}
            >
              <TopicIcon className="h-3 w-3" />
              {feedback.topic.name}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canConvertToTask && (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/feedback/board/new?feedback=${feedback.id}`}>
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Convert to Task
              </Link>
            </Button>
          )}
          {(isAuthor || isAdmin) && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/feedback/feedback/${feedback.id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
          {(isAuthor || isAdmin) && (
            <Button variant="destructive" size="sm" asChild>
              <Link href={`/feedback/feedback/${feedback.id}/delete`}>
                <LucideIcons.Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-4 prose dark:prose-invert max-w-none">
        <Markdown>{feedback.description}</Markdown>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center border-t">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={feedback.user.image || ""} alt={feedback.user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{feedback.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <UpvoteButton
          feedbackId={feedback.id}
          initialCount={feedback._count.upvotes}
        />
      </CardFooter>
    </Card>
  );
}
